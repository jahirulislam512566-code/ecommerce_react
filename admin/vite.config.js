import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Use the specific Vite plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // This now refers to @tailwindcss/vite
  ],
  server: {
    port: 5174,
  },
})