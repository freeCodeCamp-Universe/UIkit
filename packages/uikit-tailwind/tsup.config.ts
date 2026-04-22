import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/preset.ts', 'src/plugin.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  // tailwindcss is a peer — never bundle it.
  external: ['tailwindcss', 'tailwindcss/plugin']
});
