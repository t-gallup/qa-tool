/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add loader for PDF.js worker
    config.module.rules.push({
      test: /pdf\.worker\.min\.js/,
      type: 'asset/resource'
    });

    return config;
  },
};

module.exports = nextConfig;
