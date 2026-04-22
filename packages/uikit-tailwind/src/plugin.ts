// Tailwind plugin adding fCC-specific utilities and palette variants.
// Consumers enable it via { plugins: [fccPlugin] } in tailwind.config.
import plugin from 'tailwindcss/plugin';

const fccPlugin = plugin(({ addUtilities, addVariant }) => {
  addUtilities({
    '.focus-ring': {
      outline: '3px solid var(--blue-mid)',
      outlineOffset: '0'
    }
  });

  // Palette-scoped variants — mirror the .dark-palette / .light-palette
  // hooks on <html> (see packages/uikit-css/src/tokens.css).
  addVariant('fcc-dark', '&:is(.dark-palette *)');
  addVariant('fcc-light', '&:is(.light-palette *)');
});

export default fccPlugin;
