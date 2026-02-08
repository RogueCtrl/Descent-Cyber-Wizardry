import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/Descent-Cyber-Wizardry/' : '/',
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
