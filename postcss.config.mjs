// Tailwind CSS v4 PostCSS plugin registration.
// Without this file, the `@import "tailwindcss";` directive in globals.css
// is never processed and no utility classes are emitted.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
