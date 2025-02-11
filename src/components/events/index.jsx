import React from 'react';
import eventData from '../../assets/data/events.json';
import './index.scss';

export default function Events() {
  return (
    <div className="events">
      <h1>Events</h1>
      {eventData.map((data, index) => {
        const title = `🥃 Round ${index + 1}: ${data.theme}`;
        return (
          <div
            key={data.id}
            className="events-event"
          >
            <h3>{title}</h3>
            <p>{data.date}</p>
            <p>{data.description}</p>
            <a href={data.location.map} target="map">{data.location.name}</a>
            <img src={data.photo} />
          </div>
        );
      })}
    </div>
  );
}
