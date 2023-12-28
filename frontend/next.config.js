const { createProxyMiddleware } = require("http-proxy-middleware");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "http://ec2-35-170-242-83.compute-1.amazonaws.com:2500/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
