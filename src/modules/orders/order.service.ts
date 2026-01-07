import { IOrderRepository } from './order.repository';
import { validateServices } from './domain/order.rules';
import { getNextState } from './domain/order.state';
import { OrderState, CreateOrderInput, OrderEntity, ServiceInput } from './order.types';
import { AppError } from '../../shared/errors/AppError';

export interface IOrderService {
  create(data: CreateOrderInput): Promise<OrderEntity>;
  advance(id: string): Promise<OrderEntity>;
  list(state?: OrderState, page?: number, limit?: number): Promise<OrderEntity[]>;
  addService(id: string, Service: ServiceInput): Promise<OrderEntity>;
}

export class OrderService implements IOrderService {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async create(data: CreateOrderInput): Promise<OrderEntity> {
    validateServices(data.services);

    return this.orderRepository.create(data);
  }

  async advance(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    order.state = getNextState(order.state);

    return this.orderRepository.save(order);
  }

  async list(state?: OrderState, page = 1, limit = 10): Promise<OrderEntity[]> {
    return this.orderRepository.find(state, page, limit);
  }

  async addService(id: string, Service: ServiceInput) {
    const {name, value, status} = Service;
    const order =  await this.orderRepository.findById(id);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    order.services.push({ name, value, status });

    return this.orderRepository.save(order);
  }
}
