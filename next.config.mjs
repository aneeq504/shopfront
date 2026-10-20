/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  webpack(config, { nextRuntime }) {
    if (nextRuntime === "edge") {
      config.resolve.alias = {
        ...config.resolve.alias,
        "./lib/order-emails$": false,
      };
    }
    return config;
  },
};

export default nextConfig;
