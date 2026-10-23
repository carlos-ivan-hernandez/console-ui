import {resolve} from 'node:path';
import react from '@vitejs/plugin-react-swc';
import {defineConfig} from 'vite';

// `pnpm dev` serves the demo (index.html → src/demo). `pnpm build` builds the library.
const external = /^(react|react-dom|codemirror|@codemirror|@lezer|@replit)(\/|$)/;

export default defineConfig({
  server: {
    host: true,
    port: 1778,
  },
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/lib/index.ts'),
        editor: resolve(import.meta.dirname, 'src/lib/editor/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {external: id => external.test(id)},
    copyPublicDir: false,
    sourcemap: true,
  },
});
