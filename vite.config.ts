import build from '@hono/vite-build/cloudflare-pages'
import path from 'path';
import devServer from '@hono/vite-dev-server';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const globalConfig = {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };

  if (mode === 'client') {
    return {
      ...globalConfig,
      build: {
        rollupOptions: {
          input: ['./src/view/index.tsx', './src/view/style.css'],
          output: {
            entryFileNames: 'static/client.js',
            assetFileNames: 'static/[name].[ext]',
          },
        },
      },
    };
  } else {
    return {
      ...globalConfig,
      plugins: [
        build(),
        devServer({
          entry: 'src/index.ts',
        }),
      ],
    };
  }
});
