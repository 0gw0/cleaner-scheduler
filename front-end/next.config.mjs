/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: false,
  },
  env:{
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
};

export default nextConfig;
