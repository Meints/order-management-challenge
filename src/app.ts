import express from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { orderRoutes } from './modules/orders/order.routes';
import { errorMiddleware } from './shared/middlewares/error.middleware';

export const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  return res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);

app.use(errorMiddleware);
