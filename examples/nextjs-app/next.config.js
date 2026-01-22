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
      react: path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
      'react/jsx-dev-runtime': path.resolve(__dirname, '../../node_modules/react/jsx-dev-runtime'),
    };
    return config;
  },
};

module.exports = nextConfig;
