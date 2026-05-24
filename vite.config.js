import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Allow ngrok tunnels for mobile testing.
    // Covers free (ngrok-free.app), paid (ngrok.io), and new (ngrok.app) domains.
    // Remove or narrow this list before deploying to production.
    allowedHosts: [
      '.ngrok-free.app',
      '.ngrok.io',
      '.ngrok.app',
    ],
  },
});
