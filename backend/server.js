const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config();

const tmdbRoutes = require('./src/routes/tmdbRoutes');
const tmdbService = require('./src/services/tmdbService');

const app = express();
const PORT = process.env.PORT || 80;

app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
}));
app.use(express.json());

// API Health endpoint
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
  res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Endpoint not found' });
});

// Static frontend serving for production / SPA routing
const publicDir = fs.existsSync(path.resolve(__dirname, 'public'))
  ? path.resolve(__dirname, 'public')
  : (fs.existsSync(path.resolve(__dirname, '../frontend/dist')) ? path.resolve(__dirname, '../frontend/dist') : null);

if (publicDir) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'Netflix Clone API is running', status: 'success' });
  });
}

// Centralized error handling middleware (never leaks API keys or stack traces)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(`[API Error] ${req.method} ${req.originalUrl} - ${err.message}`);
  res.status(status).json({
    success: false,
    error: err.code || 'TMDB_UNAVAILABLE',
    message: err.message || 'Movie data is temporarily unavailable.'
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
