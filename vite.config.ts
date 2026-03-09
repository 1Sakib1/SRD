import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // For GitHub Pages, the base should be the repo name
  // For Vercel/Netlify/other platforms, the base should be /
  // Detect if we're building for GitHub Pages via environment variable
  const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
 
  const base = isGitHubPages ? '/Smart-Rubbish-Detection/' : '/';

  return {
    base,
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],

    build: {
      // Output directory
      outDir: 'dist',
      // Generate sourcemaps for better debugging
      sourcemap: mode === 'development',
      // Optimize for production
      minify: mode === 'production',
      rollupOptions: {
        output: {
          // Manual chunks for better caching
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router'],
            maps: ['leaflet', 'react-leaflet'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          },
        },
      },
    },
  }
})