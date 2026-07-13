import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    primitives: 'src/primitives/index.ts',
    forms: 'src/forms/index.ts',
    overlays: 'src/overlays/index.ts',
    navigation: 'src/navigation/index.ts',
    'data-display': 'src/data-display/index.ts',
    layouts: 'src/layouts/index.ts',
    games: 'src/games/index.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  external: ['react', 'react-dom', 'react/jsx-runtime', '@ark-ui/react']
});
