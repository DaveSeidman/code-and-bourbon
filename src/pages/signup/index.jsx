import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';

export default function SignUp({ user }) {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [userResponse, setUserResponse] = useState(null); // -1, 0, 1, or null

  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://code-and-bourbon-back.onrender.com';


  // Load event + signup
  const fetchData = async () => {
    if (!eventId) return;

    try {
      // Fetch Event
      const fetchedEvent = await fetch(
        `${BACKEND_URL}/api/events/${eventId}`,
        { credentials: 'include' }
      ).then(res => res.json());

      setEvent(fetchedEvent);

      // If user logged in, fetch their signup
      if (user?._id) {
        const signup = await fetch(
          `${BACKEND_URL}/api/signups?eventId=${eventId}`,
          { credentials: 'include' }
        ).then(res => res.json());

        if (signup && typeof signup.status === 'number') {
          setUserResponse(signup.status);
        } else {
          setUserResponse(null);
        }
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };


  // Handle clicking an RSVP option
  const rsvp = async (e) => {
    if (!user?._id) return;

    const id = e.target.getAttribute('data-id');
    const map = { no: -1, maybe: 0, yes: 1 };
    const status = map[id];

    try {
      const updated = await fetch(`${BACKEND_URL}/api/signups`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          status,
        }),
      }).then(res => res.json());

      if (updated && typeof updated.status === 'number') {
        setUserResponse(updated.status);
      }
    } catch (err) {
      console.error("Error saving RSVP:", err);
    }
  };


  useEffect(() => {
    fetchData();
  }, [eventId]);


  ////////////////////////////////////////////////////////
  // Render
  ////////////////////////////////////////////////////////

  return (
    <div className="signup">
      <h1>Sign Up</h1>

      {!event && <p>Select an event from the main page</p>}

      {event && (
        <div className="event">
          <h2 className="event-title">{event.theme}</h2>
          <p>{event.date}</p>
          <p>{event.location?.name}</p>

          {user ? (
            <>
              <p>You are currently:</p>

              <div className="event-rsvp">
                <button onClick={rsvp} data-id="no" className={userResponse === -1 ? 'active' : ''} >Not Coming 🥲</button>
                <button onClick={rsvp} data-id="maybe" className={userResponse === 0 ? 'active' : ''}>  Not Sure 🤔</button>
                <button onClick={rsvp} data-id="yes" className={userResponse === 1 ? 'active' : ''}>  Planning to Come 🥳</button>
              </div>
            </>
          ) : (
            <p>Login to signup for this event</p>
          )}
        </div>
      )}
    </div>
  );
}
