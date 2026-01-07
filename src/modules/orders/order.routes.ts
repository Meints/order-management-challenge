import { Router } from 'express';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();

const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

router.use(authMiddleware);

router.post('/', orderController.create);
router.get('/', orderController.list);
router.patch('/:id/advance', orderController.advance);
router.post('/:id/services', orderController.addService);

export const orderRoutes = router;
