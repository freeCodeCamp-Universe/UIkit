import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { uikit: 'src/index.ts' },
  format: ['esm', 'iife'],
  globalName: 'UIKit',
  minify: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  dts: true
});
