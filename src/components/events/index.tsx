import EventCard from '~/components/EventCard';
import type { Event } from '~/lib/db/types';
import { formatDate } from '~/utils';

import './index.scss';

type EventsProps = {
  events: Array<Event>;
};

export default function Events({ events }: EventsProps) {
  const sortedEvents = [...events].sort((a, b) => (a.date > b.date ? -1 : 1));

  return (
    <div className="page">
      <h1>Events</h1>
      <div className="events">
        {events.length === 0 ? (
          <div className="events-error">No events!</div>
        ) : (
          sortedEvents.map((data) => {
            const [year, month, day] = data.date.split('-').map(Number);
            const eventDate = new Date(year, month - 1, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const featured = eventDate >= today;

            return (
              <div key={data._id} className={`events-event ${featured ? 'featured' : ''}`}>
                <EventCard data={data} featured={featured} />
                <div className="events-event-content">
                  <h3 className="events-event-content-title">
                    {formatDate(data.date)} @{' '}
                    <a href={data.location?.map} target="map" rel="noreferrer">
                      {data.location?.name}
                    </a>
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
