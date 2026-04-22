import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/react.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  external: ['react', 'react-dom']
});
