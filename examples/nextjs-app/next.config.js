const path = require('path');

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
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Force all modules to use the same instance of React
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      // Force all modules to use the same instance of @securelend/react
      '@securelend/react': path.resolve(__dirname, 'node_modules/@securelend/react'),
    };
    return config;
  },
};

module.exports = nextConfig;
