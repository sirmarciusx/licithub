import express from 'express';
import cors from 'cors';
import biddingRoutes from './routes/biddingRoutes';
import { errorHandler } from './middleware/errorHandler';
import { getCategories } from './controllers/biddingController';

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/licitacoes', biddingRoutes);

app.get('/api/categorias', getCategories);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;