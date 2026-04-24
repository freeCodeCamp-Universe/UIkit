import { defineConfig } from 'tsup';

// @freecodecamp/uikit — React component bundle.
// Emits one entry per layer so consumers can deep-import
// (`@freecodecamp/uikit/primitives`) or pull from the root barrel.
// Peers (react, react-dom, @ark-ui/react) stay external — never
// bundle copies of the consumer's own React tree.

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    primitives: 'src/primitives/index.ts',
    forms: 'src/forms/index.ts',
    overlays: 'src/overlays/index.ts',
    navigation: 'src/navigation/index.ts',
    'data-display': 'src/data-display/index.ts',
    layouts: 'src/layouts/index.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  external: ['react', 'react-dom', 'react/jsx-runtime', '@ark-ui/react']
});
