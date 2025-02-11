import React from 'react';
import eventData from '../../assets/data/events.json';
import './index.scss';

export default function Events() {
  const sortedEvents = eventData.sort((a, b) => (a.date > b.date ? -1 : 1));

  return (
    <div className="events">
      <h1>Events</h1>
      {sortedEvents.map((data, index) => {
        const title = `🥃 Round ${sortedEvents.length - index}: ${data.theme}`;
        return (
          <div
            key={data.id}
            className="events-event"
          >
            <div className="events-event-content">
              <h3>{title}</h3>
              <p>{data.date}</p>
              <p>{data.description}</p>
              <a href={data.location.map} target="map">{data.location.name}</a>
              <img src={data.photo} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
