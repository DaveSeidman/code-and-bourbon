import { createFileRoute } from '@tanstack/react-router';

import About from '~/components/about';
import Events from '~/components/events';
import Footer from '~/components/footer';
import Hero from '~/components/hero';
import Join from '~/components/join';
import type { Event } from '~/lib/db/types';
import { getEvents } from '~/server';

export const Route = createFileRoute('/')({
  loader: async (): Promise<{ events: Array<Event> }> => {
    let events: Array<Event> = [];
    try {
      events = await getEvents();
    } catch (error) {
      console.error('Failed to load events', error);
    }
    return { events };
  },
  component: HomePage,
});

function HomePage() {
  const { events } = Route.useLoaderData();

  return (
    <>
      <Hero />
      <div className="pages">
        <About />
        <Events events={events} />
        <Join />
      </div>
      <Footer />
    </>
  );
}
