/// <reference types="vite/client" />
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import User from '~/components/user';

import '../index.scss';

export const Route = createRootRoute({
  head: () => {
    const description =
      "Coding is a Science, but it's also an Art, and art can be painful. Get together and discuss the satisfying victories and embarrassing failures we encounter on our journey to becoming better coders.";
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: 'Code & Bourbon' },
        { name: 'title', content: 'Code & Bourbon' },
        { name: 'description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://codeandbourbon.com/' },
        { property: 'og:title', content: 'Code & Bourbon' },
        { property: 'og:description', content: description },
        { property: 'og:image', content: 'https://codeandbourbon.com/og-image.png' },
        { property: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:url', content: 'https://codeandbourbon.com/' },
        { property: 'twitter:title', content: 'Code & Bourbon' },
        { property: 'twitter:description', content: description },
        { property: 'twitter:image', content: 'https://codeandbourbon.com/og-image.png' },
      ],
    };
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="app">
          {children}
          <User />
        </div>
        <Scripts />
      </body>
    </html>
  );
}
