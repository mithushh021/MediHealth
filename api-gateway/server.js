const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Explicit CORS: allow all origins, all methods (including OPTIONS preflight)
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests immediately
app.use(morgan('dev'));

// Microservices routing definitions
const routes = {
  '/patients':      'http://localhost:5001',
  '/doctors':       'http://localhost:5002',
  '/appointments':  'http://localhost:5003',
  '/prescriptions': 'http://localhost:5004'
};

// Mount proxy middleware for each route
// pathRewrite: { '^': path } is needed because Express strips the prefix before handing off to
// the proxy (e.g. /patients/123 becomes /123). We re-add the prefix so the microservice
// receives /patients/123 instead of just /123.
for (const [path, target] of Object.entries(routes)) {
  app.use(
    path,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { '^': path },
      onProxyReq: (proxyReq, req) => {
        console.log(`[Proxy] ${req.method} ${req.url} -> ${target}${proxyReq.path}`);
      },
      onError: (err, req, res) => {
        console.error(`Proxy Error for ${path}:`, err.message);
        res.status(502).json({ error: 'Service Unavailable', details: err.message });
      }
    })
  );
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API Gateway is running on http://localhost:${PORT}`);
});
