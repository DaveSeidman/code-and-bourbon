import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

import { getBackendUrl } from '../../utils';

const CHAT_PREFIX_STYLE = 'color: #0f766e; font-weight: 700;';
const CHAT_NOTICE_STYLE = 'color: #334155; font-weight: 700;';
const CHAT_WARNING_STYLE = 'color: #b45309; font-weight: 700;';
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

export default function ConsoleChat({ user, setUser }) {
  const socketRef = useRef(null);
  const historyRef = useRef([]);
  const hasLoadedHistoryRef = useRef(false);

  useEffect(() => {
    const backendUrl = getBackendUrl();
    const previousGlobals = new Map();

    const log = (message, style = CHAT_PREFIX_STYLE) => {
      console.log('%c💬 [c&b.chat]%c %s', style, '', message);
    };

    const warn = (message) => {
      console.warn('%c⚠️  [c&b.chat]%c %s', CHAT_WARNING_STYLE, '', message);
    };

    const knock = () => {
      if (!user?._id) {
        const message = 'Login first, then run knock() again.';
        warn(message);
        return message;
      }

      fetch(`${backendUrl}/api/chat/request-access`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async (response) => {
          const payload = await response.json();

          if (!response.ok) {
            warn(payload.error || 'Unable to request chat access.');
            return null;
          }

          if (payload.member && setUser) {
            setUser(payload.member);
          }

          log(payload.message, CHAT_NOTICE_STYLE);
          return payload;
        })
        .catch(() => {
          warn('Unable to request chat access.');
          return null;
        });

      return user.canUseChat
        ? 'Already inside. Checking with the gatekeeper anyway...'
        : 'Knocking...';
    };

    installGlobal('knock', knock, previousGlobals);

    if (!user?._id) {
      historyRef.current = [];
      hasLoadedHistoryRef.current = false;

      return () => {
        restoreGlobals(previousGlobals);
      };
    }

    if (!user.canUseChat) {
      log(
        user.chatAccessRequestedAt
          ? '⏳ Access request already queued. Hang tight.'
          : '🚪 Access is gated. Run knock() if you want in.',
        CHAT_NOTICE_STYLE,
      );

      return () => {
        restoreGlobals(previousGlobals);
      };
    }

    const printHistory = (messages = historyRef.current, { silentEmpty = false } = {}) => {
      if (!messages.length) {
        if (silentEmpty) {
          return messages;
        }

        log('No packets yet. Use echo("hello") to open the thread.', CHAT_NOTICE_STYLE);
        return messages;
      }

      log('Latest messages ↓', CHAT_NOTICE_STYLE);
      messages.forEach((message) => {
        log(formatChatLine(message));
      });

      return messages;
    };

    const announceAccess = () => {
      log(
        '🔓 Access granted. You found the backchannel. use echo("...") to chat.',
        CHAT_NOTICE_STYLE,
      );
    };

    const printPendingRequests = (members) => {
      const pendingMembers = members
        .filter((member) => member.chatAccessRequestedAt && !member.canUseChat)
        .sort(
          (left, right) =>
            new Date(left.chatAccessRequestedAt) - new Date(right.chatAccessRequestedAt),
        );

      if (!pendingMembers.length) {
        log('No pending access requests.', CHAT_NOTICE_STYLE);
        return pendingMembers;
      }

      log('Pending access requests ↓', CHAT_NOTICE_STYLE);
      console.table(
        pendingMembers.map((member) => ({
          name: member.displayName,
          email: member.email,
          requestedAt: member.chatAccessRequestedAt,
          requestCount: member.chatAccessRequestCount,
        })),
      );
      log(
        'Use approveChat("person@example.com") or denyChat("person@example.com").',
        CHAT_NOTICE_STYLE,
      );

      return pendingMembers;
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

    const loadMembers = async ({ pendingOnly = false } = {}) => {
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

      if (pendingOnly) {
        return printPendingRequests(payload);
      }

      console.table(
        payload.map((member) => ({
          name: member.displayName,
          email: member.email,
          approved: member.chatApproved,
          admin: member.isChatAdmin,
          canUseChat: member.canUseChat,
          requestedAt: member.chatAccessRequestedAt,
          approvedAt: member.chatApprovedAt,
        })),
      );

      return payload;
    };

    const updateChatAccess = async (identifier, approved, { clearRequest = false } = {}) => {
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
          clearRequest,
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

      await loadMembers({ pendingOnly: true });

      return payload;
    };

    installGlobal('echo', echo, previousGlobals);
    installGlobal('chatHistory', () => printHistory(), previousGlobals);

    if (user.isChatAdmin) {
      installGlobal('chatMembers', loadMembers, previousGlobals);
      installGlobal('chatPending', () => loadMembers({ pendingOnly: true }), previousGlobals);
      installGlobal(
        'approveChat',
        (identifier) => updateChatAccess(identifier, true, { clearRequest: true }),
        previousGlobals,
      );
      installGlobal(
        'revokeChat',
        (identifier) => updateChatAccess(identifier, false),
        previousGlobals,
      );
      installGlobal(
        'denyChat',
        (identifier) => updateChatAccess(identifier, false, { clearRequest: true }),
        previousGlobals,
      );
    }

    announceAccess();

    if (user.isChatAdmin) {
      loadMembers({ pendingOnly: true });
    }

    const socket = io(backendUrl, {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('disconnect', (reason) => {
      if (reason !== 'io client disconnect') {
        warn('Socket dropped. Retrying...');
      }
    });

    socket.on('connect_error', (error) => {
      warn(error.message || 'Unable to connect to chat.');
    });

    socket.on('chat:history', (messages) => {
      historyRef.current = messages;

      if (!hasLoadedHistoryRef.current) {
        hasLoadedHistoryRef.current = true;
        printHistory(messages, { silentEmpty: true });
        return;
      }
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
  }, [user?._id, user?.canUseChat, user?.isChatAdmin, user?.chatAccessRequestedAt]);

  return null;
}
