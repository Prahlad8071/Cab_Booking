import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use root base if deployed on Vercel or Render, else use GitHub Pages base
  base: (process.env.VERCEL || process.env.RENDER) ? '/' : '/Cab_Booking/',
})
