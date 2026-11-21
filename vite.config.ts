import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths keep the build portable on GitHub project pages.
  base: './',
  plugins: [react()],
})
