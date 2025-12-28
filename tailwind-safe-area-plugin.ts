import plugin from 'tailwindcss/plugin';

export default plugin(function ({ addUtilities }) {
  const newUtilities = {
    // Top safe area for headers (Dynamic Island / notch / status bar)
    '.pt-safe-header': {
      paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)',
    },
    '.pt-safe-16': {
      paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)',
    },
    '.pt-safe-20': {
      paddingTop: 'max(env(safe-area-inset-top, 0px), 20px)',
    },
    // Bottom safe area for bottom navigation
    '.pb-safe-nav': {
      paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
    },
    // Generic horizontal safe areas
    '.pl-safe': {
      paddingLeft: 'max(env(safe-area-inset-left, 0px), 0px)',
    },
    '.pr-safe': {
      paddingRight: 'max(env(safe-area-inset-right, 0px), 0px)',
    },
    // Margin variants
    '.mt-safe-header': {
      marginTop: 'max(env(safe-area-inset-top, 0px), 12px)',
    },
  };

  addUtilities(newUtilities);
});
