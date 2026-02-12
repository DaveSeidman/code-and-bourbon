import { createFileRoute } from '@tanstack/react-router';

import { useUser } from '~/auth/useUser';
import About from '~/components/about';
import Events from '~/components/events';
import Footer from '~/components/footer';
import Hero from '~/components/hero';
import Join from '~/components/join';
import User from '~/components/user';

const HomePage = () => {
  const { user, setUser } = useUser();
  return (
    <>
      <Hero />
      <div className="pages">
        <About />
        <Events />
        <Join />
      </div>
      <Footer />
      <User user={user} setUser={setUser} />
    </>
  );
};

export const Route = createFileRoute('/')({
  component: HomePage,
});
