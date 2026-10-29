const express = require('express');
const cors = require('cors');
require('dotenv').config();

const tmdbRoutes = require('./src/routes/tmdbRoutes');
const tmdbService = require('./src/services/tmdbService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
}));
app.use(express.json());

// Health & Root endpoints
app.get('/', (req, res) => {
  res.json({ message: 'Netflix Clone API is running', status: 'success' });
});

app.get('/api/health', (req, res) => {
  const creds = tmdbService.validateCredentials();
  res.json({
    status: 'OK',
    tmdbConfigured: creds.valid,
    timestamp: new Date().toISOString()
  });
});

// TMDB Proxy Routes
app.use('/api/tmdb', tmdbRoutes);
app.use('/api', tmdbRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
});

// Centralized error handling middleware (never leaks API keys or stack traces)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(`[API Error] ${req.method} ${req.originalUrl} - ${err.message}`);
  res.status(status).json({
    error: 'TMDB request failed',
    message: err.message || 'Unable to reach TMDB'
  });
});

// Startup check
const credsCheck = tmdbService.validateCredentials();
if (credsCheck.valid) {
  console.log('✓ TMDB API credentials detected.');
} else {
  console.warn(`⚠ ${credsCheck.message}`);
}

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };
