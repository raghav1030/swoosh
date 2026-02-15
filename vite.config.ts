import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills(),
    crx({ manifest }),
  ],
  server: {
    // This ensures that when you visit /onboarding.html, Vite serves it
    open: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        onboarding: path.resolve(__dirname, 'onboarding.html'),
      },
    },
  },
  // cors: {
  //   origin: [
  //     "chrome-extension://jjikigjnfeogeefjleigkanlbdefhhpm",
  //     "http://localhost:5173"
  //   ],
  //   methods: ["GET", "POST"],
  //   allowedHeaders: ["Content-Type", "Authorization"],
  // },
})