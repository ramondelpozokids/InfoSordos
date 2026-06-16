import { defineConfig } from 'vite';
import { resolve } from 'path';
import injectHtml from 'vite-plugin-html-inject';

export default defineConfig({
  plugins: [
    injectHtml()
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        services: resolve(__dirname, 'services.html'),
        tutorials: resolve(__dirname, 'tutorials.html'),
        blog: resolve(__dirname, 'blog.html'),
        contact: resolve(__dirname, 'contact.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        cookies: resolve(__dirname, 'cookies.html'),
        terms: resolve(__dirname, 'terms.html'),
        sitemap: resolve(__dirname, 'sitemap.html')
      }
    },
    outDir: 'dist',
    minify: 'esbuild',
    cssMinify: true
  }
});
