const BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://parkx-server-63im.onrender.com';

const FRONTEND_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5173'
    : 'https://parkx-main.vercel.app';

console.log(process.env.NODE_ENV);

module.exports = { BASE_URL, FRONTEND_BASE_URL };