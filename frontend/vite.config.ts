import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig((env) => {
  const envDir = '../';
  const envars = loadEnv(env.mode, envDir);
  const serverURL = new URL(
    envars.VITE_API_SERVER_URL ?? 'http://localhost:3000'
  );
  const serverAPIPath = envars.VITE_API_PATH ?? '/api';

  return {
    envDir: envDir,

    // make the API path globally available in the client
    define: {
      __API_PATH__: JSON.stringify(serverAPIPath),
    },

    plugins: [
      vue(),
      vueDevTools(),
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },

    server: {
      port: 5173,
      proxy: {
        // proxy requests with the API path to the server
        // <http://localhost:5173/api> -> <http://localhost:3000/api>
        [serverAPIPath]: serverURL.origin,
      },
    },
  }
})
