import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function SignUp({ user }) {
  const { eventId } = useParams();
  const [event, setEvent] = useState({});

  const fetchData = async () => {
    if (!eventId) return;

    const BACKEND_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://code-and-bourbon-back.onrender.com';

    const fetchedEvent = await fetch(`${BACKEND_URL}/api/events/${eventId}`).then((res) => res.json());
    setEvent(fetchedEvent);
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="signup">
      <h1>Sign Up</h1>
      {event._id
        ? (
          <div className="event">
            <h2 className="event-title">{event.theme}</h2>
            <p>{event.date}</p>
            <p>{event.location?.name}</p>
            <p>{user
              ? (<button>Signup here</button>)
              : (<p>Login to Signup for this event</p>)}
            </p>
          </div>
        ) : (
          <p>Select an event from the main page</p>
        )}
    </div>
  );
}
