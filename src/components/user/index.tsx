import { authClient } from '~/lib/auth/auth-client';

import './index.scss';

export default function User() {
  const { data: session } = authClient.useSession();

  const login = () => {
    authClient.signIn.social({
      provider: 'google',
      callbackURL: typeof window !== 'undefined' ? window.location.href : '/',
    });
  };

  const logout = () => {
    authClient.signOut();
  };

  return (
    <div className="nav">
      {session?.user ? (
        <div className="nav-user">
          <p>
            Welcome,&nbsp;
            {session.user.name}
          </p>
          {session.user.image && (
            <img src={session.user.image} alt="Profile" width="50" />
          )}
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <button type="button" onClick={login}>
          Login
        </button>
      )}
    </div>
  );
}
