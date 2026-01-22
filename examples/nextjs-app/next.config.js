const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // This allows production builds to successfully complete even if
    // your project has ESLint errors. We're disabling it for the example app
    // to prevent it from blocking the SDK publishing process.
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['@securelend/sdk', '@securelend/react', '@securelend/widgets', '@modelcontextprotocol/sdk', 'pkce-challenge'],
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
      // Force all modules to use the same instance of React and SecureLend context
      react: path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
      '@securelend/react': path.resolve(__dirname, '../../packages/react/src'),
    };
    return config;
  },
};

module.exports = nextConfig;
