/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@securelend/sdk', '@securelend/react', '@securelend/widgets'],
  async rewrites() {
    return [
      {
        source: '/api/mcp',
        destination: 'https://mcp.securelend.ai/mcp',
      },
    ]
  },
};

module.exports = nextConfig;
