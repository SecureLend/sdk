/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@securelend/sdk', '@securelend/react', '@securelend/widgets'],
};

module.exports = nextConfig;
