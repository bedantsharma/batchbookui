// src/entry-server.jsx
//
// Build-time only. NOT shipped to the browser — Vite compiles this into
// dist/server/entry-server.js via `vite build --ssr`, and scripts/prerender.mjs
// runs that bundle in Node to turn the public marketing pages into real,
// crawlable HTML (search engines otherwise see only the empty <div id="root">
// of a client-rendered SPA).
//
// Scope is deliberately narrow: only the public, unauthenticated pages that
// search engines should ever index. Everything behind a login (owner/student
// dashboards, onboarding, etc.) stays pure client-rendered — there's nothing
// there for a crawler to usefully index anyway, and rendering it here would
// mean faking auth state.
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { darkTheme } from './theme';
import LandingPage from './components/LandingPage';
import PrivacyPolicy from './components/PrivacyPolicy';

// Path -> { Component, title, description } for every page that gets prerendered.
// scripts/prerender.mjs iterates this map, so adding a new public page to
// prerender is just adding an entry here.
export const PRERENDER_ROUTES = {
  '/': {
    Component: LandingPage,
    title: 'BatchBook — Coaching Institute Management Software for Tuition Centers',
    description:
      'BatchBook is coaching institute management software built for solo teachers and small tuition centers in India. Manage fees, attendance, and test scores from your phone — no more WhatsApp and paper registers.',
  },
  '/privacy-policy': {
    Component: PrivacyPolicy,
    title: 'Privacy Policy — BatchBook',
    description: 'How BatchBook collects, uses, and protects data for coaching institutes, teachers, students, and parents.',
  },
};

export function render(url) {
  const route = PRERENDER_ROUTES[url];
  if (!route) {
    throw new Error(`No prerender route registered for "${url}"`);
  }
  const { Component } = route;
  const html = renderToString(
    <StaticRouter location={url}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Component />
      </ThemeProvider>
    </StaticRouter>,
  );
  return { html, title: route.title, description: route.description };
}
