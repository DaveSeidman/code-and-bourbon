import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils';
import EventCard from '../EventCard';
import './index.scss';

export default function Events() {
  const [events, setEvents] = useState([]);
  // const navigate = useNavigate();

  const fetchData = async () => {
    const BACKEND_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://code-and-bourbon-back.onrender.com';

    try {
      const fetchedEvents = await fetch(`${BACKEND_URL}/api/events`).then((res) => res.json());
      console.log(fetchedEvents);
      setEvents(fetchedEvents);
    } catch (err) {
      console.log('cms unreachable');
      // setEvents([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sortedEvents = [...events].sort((a, b) => (a.date > b.date ? -1 : 1));

  return (
    <div className="page">
      <h1>Events</h1>
      <div className="events">
        {events.length === 0 ? (
          <div className="events-loading">Loading events...</div>
        ) : (
          sortedEvents.map((data, index) => {
            // const prefix = `🥃 Round ${sortedEvents.length - index}: `;
            const [year, month, day] = data.date.split('-').map(Number);
            const eventDate = new Date(year, month - 1, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const featured = eventDate >= today;

            return (
              <div
                key={data._id}
                className={`events-event ${featured ? 'featured' : ''}`}
              >
                <EventCard data={data} featured={featured}></EventCard>
                <div className="events-event-content">
                  <h3 className="events-event-content-title">
                    {formatDate(data.date)} @ <a href={data.location.map} target="map">{data.location.name}</a>
                  </h3>
                  <p
                    className="events-event-content-description"
                    dangerouslySetInnerHTML={{ __html: data.description }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
