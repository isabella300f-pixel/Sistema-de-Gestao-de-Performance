/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    // Resolver problemas de case sensitivity no Windows
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Desabilitar cache em desenvolvimento para evitar problemas
    if (dev) {
      config.cache = false;
    }
    
    // Desabilitar symlinks para evitar problemas de case sensitivity
    config.resolve.symlinks = false;
    
    return config;
  },
}

module.exports = nextConfig

