/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable Webpack 5, which is the default in newer versions of Next.js
    future: {
      webpack5: true,
    },
    webpack(config) {
      // Fallback configuration for the Webpack
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // Disable 'fs' module as it's not available in the browser
      };
  
      return config;
    },
  };
  
  export default nextConfig;
  