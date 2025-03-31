import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig((env) => {
  const envDir = '../';
  const envars = loadEnv(env.mode, envDir);
  const serverURL = new URL(
    envars.VITE_API_SERVER_URL ?? 'http://localhost:3000'
  );
  const serverAPIPath = envars.VITE_API_PATH ?? '/api/v1';

  return {
    envDir: envDir,

    // make the API path globally available in the client
    define: {
      __API_PATH__: JSON.stringify(serverAPIPath),
    },

    plugins: [
      vue(),
      vueDevTools(),
      VitePWA({
        injectRegister: 'auto',
        includeAssets: [
          'favicon.ico',
          'icons/*',
        ],
        manifest: {
          name: "GPSTracker",
          short_name: "GPSTracker",
          theme_color: "#3498db",
          icons: [
            {
              src: "./icons/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: "./icons/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png"
            },
          ],
          start_url: ".",
          display: "standalone"
        },
      }),
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },

    server: {
      port: 5173,
      proxy: {
        // Proxy requests with the API path to the server
        // <http://localhost:5173/api> -> <http://localhost:3000/api>
        [serverAPIPath]: serverURL.origin,
        // Proxy requests to /icons/poi.svg to the server
        '/icons/poi.svg': `${serverURL.origin}`,
      },
    },
  }
})
