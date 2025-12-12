import React from 'react';

import './index.scss';

export default function EventCard({ data, featured }) {
  return (
    <div className="event-card">
      <img className="event-card-image" src={data.photo} alt={`Event ${data.theme}`} />
      <div className="event-card-fade" />
      <h3 className="event-card-title">
        <span className="thin">Round {data.order}: </span>
        <span>{data.theme}</span>
      </h3>
      {featured && (
        <a className="event-card-signup" type="button" href={`/signup/${data._id}`}>
          Sign Up Now!
        </a>
      )}
    </div>
  );
}
