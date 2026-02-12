import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

import { authClient } from '~/lib/auth/auth-client';
import { getEventById, getSignup, saveSignup } from '~/server';
import { formatDate } from '~/utils';

import './index.scss';

export const Route = createFileRoute('/signup/$eventId')({
  loader: async ({ params }) => {
    const eventId = params.eventId;
    const [event, signup] = await Promise.all([
      getEventById({ data: { eventId } }),
      getSignup({ data: { eventId } }),
    ]);
    return { event, signup };
  },
  component: SignUpPage,
});

function SignUpPage() {
  const { data: session } = authClient.useSession();
  const { eventId } = Route.useParams();
  const { event, signup } = Route.useLoaderData();
  const [userResponse, setUserResponse] = useState<-1 | 0 | 1 | null>(signup?.status ?? null);

  const eventHasPassed = useRef(event ? new Date(event.date) < new Date() : true);

  const rsvp = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!session?.user?.id) return; // guard: session may not be loaded yet

    const id = (e.target as HTMLButtonElement).getAttribute('data-id');
    const map: Record<string, -1 | 0 | 1> = { no: -1, maybe: 0, yes: 1 };
    const status = map[id ?? ''];

    try {
      const updated = await saveSignup({ data: { eventId, status } });
      setUserResponse(updated.status);
      toast('Thanks for Responding!');
    } catch (err) {
      console.error('Error saving RSVP:', err);
      toast('There was an issue saving your response');
    }
  };

  return (
    <div className="signup">
      <header className="signup-header">
        <a className="home" href="/">
          🥃 &nbsp; Back Home
        </a>
        <h1>Sign Up</h1>
      </header>
      {!event && <p>Select an event from the main page</p>}

      {!!event && (
        <div className="event">
          <h2 className="event-title">{event.theme}</h2>
          <div className="event-body">
            <div className="event-body-photo-container">
              <img className="event-body-photo" src={`../${event.photo}`} alt="" />
            </div>
            <p className="event-body-description">{event.description}</p>
          </div>
          <h3 className="events-event-content-title">
            {formatDate(event.date)} @{' '}
            <a href={event.location?.map} target="map" rel="noreferrer">
              {event.location?.name}
            </a>{' '}
            7pm-10pm
          </h3>

          {session?.user ? (
            <>
              <p>You are currently:</p>
              <div className={`event-rsvp ${eventHasPassed.current ? 'past' : ''}`}>
                <button onClick={rsvp} data-id="no" className={userResponse === -1 ? 'active' : ''}>
                  Not Coming 🥲
                </button>
                <button
                  onClick={rsvp}
                  data-id="maybe"
                  className={userResponse === 0 ? 'active' : ''}
                >
                  Not Sure 🤔
                </button>
                <button onClick={rsvp} data-id="yes" className={userResponse === 1 ? 'active' : ''}>
                  Planning to Come 🥳
                </button>
              </div>
            </>
          ) : (
            <p>Login to signup for this event</p>
          )}
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
