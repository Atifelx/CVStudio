/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Handle pdfjs-dist canvas dependency
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `canvas` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
      };
    }
    
    // Ignore canvas in pdfjs-dist
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    return config;
  },
}

module.exports = nextConfig
