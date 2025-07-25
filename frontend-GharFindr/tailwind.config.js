module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: '#6C63FF',
        'primary-dark': '#574FDB', // optional, for hover
      },
    },
  },
  plugins: [],
};
