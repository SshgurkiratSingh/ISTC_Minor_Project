const { createProxyMiddleware } = require("http-proxy-middleware");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "http://localhost:2500/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
