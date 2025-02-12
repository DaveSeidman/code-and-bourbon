import React from 'react';
import eventData from '../../assets/data/events.json';
import './index.scss';

export default function Events() {
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + 1)); // Add 1 to correct for zero-index issue
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const sortedEvents = eventData.sort((a, b) => (a.date > b.date ? -1 : 1));

  return (
    <div className="page">
      <h1>Events</h1>
      <div className="events">
        {sortedEvents.map((data, index) => {
          const prefix = `Round ${sortedEvents.length - index} 🥃 `;
          const featured = new Date(data.date) > new Date();
          return (
            <div
              key={data.id}
              className={`events-event ${featured ? 'featured' : ''}`}
            >
              <div className="events-event-banner">
                <img src={data.photo} alt={`Event ${data.theme}`} />
                <div className="events-event-banner-fade" />
                <h3>
                  <span className="bold">{prefix}</span>
                  <span className="">{data.theme}</span>
                </h3>
                {featured && <button type="button">Sign Up!</button>}
              </div>
              <div className="events-event-content">
                <h3 className="events-event-content-dateplace">
                  {formatDate(data.date)} @ <a href={data.location.map} target="map">{data.location.name}</a>
                </h3>
                <p
                  className="events-event-content-description"
                  dangerouslySetInnerHTML={{ __html: data.description }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
