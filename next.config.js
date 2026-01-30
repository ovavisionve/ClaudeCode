/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    SPREADSHEET_ID: process.env.SPREADSHEET_ID,
  },
}

module.exports = nextConfig
