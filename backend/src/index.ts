import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { handleInterviewRequest, handleHealthCheck } from './controllers/interviewController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Contract Endpoint
app.post('/api/interview', handleInterviewRequest);
app.get('/api/health', handleHealthCheck);

// Serve frontend static build if available
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (require('fs').existsSync(path.join(frontendDist, 'index.html'))) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }
  res.send('AI Technical Interviewer API Server Running. Connect via frontend or POST /api/interview.');
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 AI Interviewer Backend active at http://localhost:${PORT}`);
  console.log(`Endpoint: POST http://localhost:${PORT}/api/interview`);
  console.log(`====================================================`);
});
