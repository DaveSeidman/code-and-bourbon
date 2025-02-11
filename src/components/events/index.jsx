import React from 'react';
import eventData from '../../assets/data/events.json';
import './index.scss';

export default function Events() {
  return (
    <div className="events">
      {eventData.map((data) => (
        <div
          key={data.id}
          className="events-event"
        >
          <h3>{data.theme}</h3>
          <p>{data.date}</p>
          <p>{data.description}</p>
          <a href={data.location.map}>{data.location.name}</a>
          <img src={data.photo} />
        </div>
      ))}
    </div>
  );
}
