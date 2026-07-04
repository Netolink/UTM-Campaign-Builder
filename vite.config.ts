import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

// Automatically create a dummy firebase-applet-config.json if it is missing at build time (e.g., in GitHub Actions)
const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(
    configPath,
    JSON.stringify(
      {
        apiKey: "dummy-api-key-for-build-purposes",
        authDomain: "dummy-auth-domain",
        projectId: "dummy-project-id",
        storageBucket: "dummy-storage-bucket",
        messagingSenderId: "dummy-sender-id",
        appId: "dummy-app-id"
      },
      null,
      2
    )
  );
  console.log('firebase-applet-config.json was missing. Created a dummy config for build/compilation purposes.');
}

export default defineConfig(() => {
  return {
    // הגדרה דינמית: ב-GitHub Actions משתמש בנתיב הריפו, ב-Studio משתמש בנתיב הראשי
    base: process.env.GITHUB_ACTIONS ? '/UTM-Campaign-Builder/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});