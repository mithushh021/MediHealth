const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));

// Microservices routing definitions
const routes = {
  '/patients': 'http://localhost:5001',
  '/doctors': 'http://localhost:5002',
  '/appointments': 'http://localhost:5003',
  '/prescriptions': 'http://localhost:5004'
};

// Mount proxy middleware for each route
for (const [path, target] of Object.entries(routes)) {
  app.use(
    path,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: {
        '^': path, // Prepend the path back (e.g. /123 -> /doctors/123)
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] Forwarding ${req.method} ${req.url} -> ${target}${proxyReq.path}`);
      },
      onError: (err, req, res) => {
        console.error(`Proxy Error for ${path}:`, err.message);
        res.status(500).json({ error: 'Service Unavailable' });
      }
    })
  );
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway is running' });
});

app.listen(PORT, () => {
  console.log(`API Gateway is running on http://localhost:${PORT}`);
});
