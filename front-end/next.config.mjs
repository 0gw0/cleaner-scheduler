/** @type {import('next').NextConfig} */
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true,
  experimental: {
    appDir: false,
  },
  env:{
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
};

export default nextConfig;

