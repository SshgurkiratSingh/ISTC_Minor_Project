const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = createProxyMiddleware({
  target: 'http://ec2-3-88-49-62.compute-1.amazonaws.com:2500/',
  changeOrigin: true,
  pathRewrite: {
    '^/api/': '/api/', // remove base path
  },
});
