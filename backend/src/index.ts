import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import { handleInterviewRequest, handleHealthCheck } from './controllers/interviewController';
import { sessionStore } from './services/sessionStore';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per IP per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// API Contract Endpoint
app.post('/api/interview', limiter, handleInterviewRequest);
app.get('/api/health', handleHealthCheck);

// Serve frontend static build if available
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

const hasFrontendIndex = fs.existsSync(path.join(frontendDist, 'index.html'));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (hasFrontendIndex) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }
  res.send('AI Technical Interviewer API Server Running. Connect via frontend or POST /api/interview.');
});

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 AI Interviewer Backend active at http://localhost:${PORT}`);
  console.log(`Endpoint: POST http://localhost:${PORT}/api/interview`);
  console.log(`====================================================`);
});

// Graceful shutdown
function gracefulShutdown() {
  console.log('\nReceived shutdown signal, initiating graceful shutdown...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
