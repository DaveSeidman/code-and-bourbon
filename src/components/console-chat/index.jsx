import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

import { getBackendUrl } from '../../utils';

const CHAT_PREFIX_STYLE = 'color: #8b5e3c; font-weight: 700;';
const CHAT_NOTICE_STYLE = 'color: #49617b; font-weight: 700;';
const CHAT_WARNING_STYLE = 'color: #a13a2b; font-weight: 700;';
const HISTORY_LIMIT = 25;

const formatChatTimestamp = (createdAt) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(createdAt));

const formatChatLine = (message) =>
  `[${formatChatTimestamp(message.createdAt)}] ${message.senderDisplayName}: ${message.text}`;

const parseConsoleMessage = (input, values) => {
  if (Array.isArray(input) && Object.prototype.hasOwnProperty.call(input, 'raw')) {
    return String.raw({ raw: input }, ...values);
  }

  if (typeof input === 'string' && values.length === 0) {
    return input;
  }

  return null;
};

const installGlobal = (name, value, previousGlobals) => {
  previousGlobals.set(name, {
    exists: Object.prototype.hasOwnProperty.call(window, name),
    value: window[name],
  });

  window[name] = value;
};

const restoreGlobals = (previousGlobals) => {
  previousGlobals.forEach(({ exists, value }, name) => {
    if (exists) {
      window[name] = value;
      return;
    }

    delete window[name];
  });
};

export default function ConsoleChat({ user }) {
  const socketRef = useRef(null);
  const historyRef = useRef([]);
  const hasLoadedHistoryRef = useRef(false);

  useEffect(() => {
    if (!user?.canUseChat) {
      historyRef.current = [];
      hasLoadedHistoryRef.current = false;
      return undefined;
    }

    const backendUrl = getBackendUrl();
    const previousGlobals = new Map();

    const log = (message, style = CHAT_PREFIX_STYLE) => {
      console.log('%c[c&b chat]%c %s', style, '', message);
    };

    const warn = (message) => {
      console.warn('%c[c&b chat]%c %s', CHAT_WARNING_STYLE, '', message);
    };

    const printHistory = (messages = historyRef.current) => {
      if (!messages.length) {
        log('No messages yet. Type echo("hello") to start things off.', CHAT_NOTICE_STYLE);
        return messages;
      }

      log('Recent messages:', CHAT_NOTICE_STYLE);
      messages.forEach((message) => {
        log(formatChatLine(message));
      });

      return messages;
    };

    const showHelp = () => {
      log('Use echo("hello") or echo`hello` to post a message.', CHAT_NOTICE_STYLE);
      log('`say()` still works too, if you already got used to it.', CHAT_NOTICE_STYLE);
      log('Run chatHistory() any time to print the latest messages again.', CHAT_NOTICE_STYLE);

      if (user.isChatAdmin) {
        log(
          'Admin commands: chatMembers(), approveChat("person@example.com"), revokeChat("person@example.com").',
          CHAT_NOTICE_STYLE,
        );
      }
    };

    const echo = (input, ...values) => {
      const message = parseConsoleMessage(input, values);

      if (message === null) {
        warn('Chat only accepts plain text strings. Use echo("hello") or echo`hello`.');
        return;
      }

      if (!socketRef.current?.connected) {
        warn('Chat is not connected right now.');
        return;
      }

      socketRef.current.emit('chat:send', message, (response) => {
        if (!response?.ok) {
          warn(response?.error || 'Unable to send message.');
        }
      });
    };

    const loadMembers = async () => {
      if (!user.isChatAdmin) {
        warn('Only chat admins can review access.');
        return [];
      }

      const response = await fetch(`${backendUrl}/api/chat/members`, {
        credentials: 'include',
      });
      const payload = await response.json();

      if (!response.ok) {
        warn(payload.error || 'Unable to load members.');
        return [];
      }

      console.table(
        payload.map((member) => ({
          name: member.displayName,
          email: member.email,
          approved: member.chatApproved,
          admin: member.isChatAdmin,
          canUseChat: member.canUseChat,
          approvedAt: member.chatApprovedAt,
        })),
      );

      return payload;
    };

    const updateChatAccess = async (identifier, approved) => {
      if (!user.isChatAdmin) {
        warn('Only chat admins can change access.');
        return null;
      }

      if (typeof identifier !== 'string' || !identifier.trim()) {
        warn('Pass an email address or member id, like approveChat("person@example.com").');
        return null;
      }

      const response = await fetch(`${backendUrl}/api/chat/members/access`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          approved,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        warn(payload.error || 'Unable to update chat access.');
        return null;
      }

      log(
        `${payload.displayName || payload.email} now has chat access: ${payload.canUseChat ? 'yes' : 'no'}.`,
        CHAT_NOTICE_STYLE,
      );

      return payload;
    };

    installGlobal('echo', echo, previousGlobals);
    installGlobal('say', echo, previousGlobals);
    installGlobal('chatHistory', () => printHistory(), previousGlobals);
    installGlobal('chatHelp', showHelp, previousGlobals);

    if (user.isChatAdmin) {
      installGlobal('chatMembers', loadMembers, previousGlobals);
      installGlobal(
        'approveChat',
        (identifier) => updateChatAccess(identifier, true),
        previousGlobals,
      );
      installGlobal(
        'revokeChat',
        (identifier) => updateChatAccess(identifier, false),
        previousGlobals,
      );
    }

    showHelp();

    const socket = io(backendUrl, {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      log('Connected.', CHAT_NOTICE_STYLE);
    });

    socket.on('disconnect', (reason) => {
      if (reason !== 'io client disconnect') {
        warn('Disconnected from chat. Socket.IO will keep trying to reconnect.');
      }
    });

    socket.on('connect_error', (error) => {
      warn(error.message || 'Unable to connect to chat.');
    });

    socket.on('chat:history', (messages) => {
      historyRef.current = messages;

      if (!hasLoadedHistoryRef.current) {
        hasLoadedHistoryRef.current = true;
        printHistory(messages);
        return;
      }

      log('History refreshed. Run chatHistory() to print it again.', CHAT_NOTICE_STYLE);
    });

    socket.on('chat:message', (message) => {
      historyRef.current = [...historyRef.current, message].slice(-HISTORY_LIMIT);
      log(formatChatLine(message));
    });

    socket.on('chat:access-revoked', () => {
      restoreGlobals(previousGlobals);
      historyRef.current = [];
      warn('Chat access was revoked. Refresh after you are approved again.');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      historyRef.current = [];
      hasLoadedHistoryRef.current = false;
      restoreGlobals(previousGlobals);
    };
  }, [user?._id, user?.canUseChat, user?.isChatAdmin]);

  return null;
}
