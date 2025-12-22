const BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://gateway-6epe.onrender.com';

const FRONTEND_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5173'
    : 'https://itdepartment-main.vercel.app';

console.log(process.env.NODE_ENV);

module.exports = { BASE_URL, FRONTEND_BASE_URL };