/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [
    // Tailwind v3 does not generate opacity modifiers on arbitrary CSS
    // variable colors (bg-[var(--ack-card)]/75) on its own.
    'bg-[var(--ack-card)]/75',
    'bg-[var(--ack-card)]/95',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
