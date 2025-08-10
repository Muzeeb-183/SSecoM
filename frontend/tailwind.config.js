/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your existing SSecoM color scheme
        'logo-purple': '#7C3AED',
        'navbar-bg': '#FFFFFF',
        'nav-text': '#374151',
        'nav-hover': '#7C3AED',
        'content-bg': '#F9FAFB',
        'card-bg': '#FFFFFF',
        'heading': '#1F2937',
        'subheading': '#4B5563',
        'body-text': '#6B7280',
        'button-primary': '#7C3AED',
        'button-hover': '#6D28D9',
        'button-text': '#FFFFFF',
        'accent-blue': '#3B82F6',
        'accent-green': '#10B981',
        'success-text': '#059669',
        'error-text': '#DC2626',
        'warning-text': '#D97706',
        'footer-bg': '#1F2937',
        'footer-text': '#D1D5DB',
        'border-light': '#E5E7EB',
        'border-medium': '#D1D5DB'
      },
      boxShadow: {
        'student': '0 4px 6px -1px rgba(124, 58, 237, 0.1), 0 2px 4px -1px rgba(124, 58, 237, 0.06)',
        'card-hover': '0 10px 25px -3px rgba(124, 58, 237, 0.1), 0 4px 6px -2px rgba(124, 58, 237, 0.05)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ],
}
