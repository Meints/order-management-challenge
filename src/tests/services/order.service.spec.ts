import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService } from '../../modules/orders/order.service';
import { IOrderRepository } from '../../modules/orders/order.repository';
import {
  OrderState,
  OrderStatus,
  ServiceStatus,
  CreateOrderInput,
  OrderEntity,
  OrderDocument,
} from '../../modules/orders/order.types';

const mockOrderRepository: IOrderRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  find: vi.fn(),
  save: vi.fn(),
};

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    vi.clearAllMocks();
    orderService = new OrderService(mockOrderRepository);
  });

  describe('create', () => {
    it('deve criar um pedido com sucesso', async () => {
      const input: CreateOrderInput = {
        lab: 'Lab A',
        patient: 'Patient A',
        customer: 'Customer A',
        services: [{ name: 'Service 1', value: 100 }],
      };

      const mockOrder: OrderEntity = {
        id: '123',
        ...input,
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
      };

      vi.mocked(mockOrderRepository.create).mockResolvedValue(mockOrder);

      const result = await orderService.create(input);

      expect(result).toEqual(mockOrder);
      expect(mockOrderRepository.create).toHaveBeenCalledWith(input);
    });

    it('deve lançar erro quando não há serviços', async () => {
      const input: CreateOrderInput = {
        lab: 'Lab A',
        patient: 'Patient A',
        customer: 'Customer A',
        services: [],
      };

      await expect(orderService.create(input)).rejects.toThrow(
        'Order must have at least one service'
      );
      expect(mockOrderRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando valor total é zero', async () => {
      const input: CreateOrderInput = {
        lab: 'Lab A',
        patient: 'Patient A',
        customer: 'Customer A',
        services: [{ name: 'Service 1', value: 0 }],
      };

      await expect(orderService.create(input)).rejects.toThrow(
        'Order total value must be greater than zero'
      );
      expect(mockOrderRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('advance', () => {
    it('deve avançar pedido de CREATED para ANALYSIS', async () => {
      const mockOrder: OrderDocument = {
        id: '123',
        lab: 'Lab A',
        patient: 'Patient A',
        customer: 'Customer A',
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        save: vi.fn(),
      };

      const savedOrder: OrderEntity = {
        ...mockOrder,
        state: OrderState.ANALYSIS,
      };

      vi.mocked(mockOrderRepository.findById).mockResolvedValue(mockOrder);
      vi.mocked(mockOrderRepository.save).mockResolvedValue(savedOrder);

      const result = await orderService.advance('123');

      expect(result.state).toBe(OrderState.ANALYSIS);
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });

    it('deve avançar pedido de ANALYSIS para COMPLETED', async () => {
      const mockOrder: OrderDocument = {
        id: '123',
        lab: 'Lab A',
        patient: 'Patient A',
        customer: 'Customer A',
        state: OrderState.ANALYSIS,
        status: OrderStatus.ACTIVE,
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        save: vi.fn(),
      };

      const savedOrder: OrderEntity = {
        ...mockOrder,
        state: OrderState.COMPLETED,
      };

      vi.mocked(mockOrderRepository.findById).mockResolvedValue(mockOrder);
      vi.mocked(mockOrderRepository.save).mockResolvedValue(savedOrder);

      const result = await orderService.advance('123');

      expect(result.state).toBe(OrderState.COMPLETED);
    });

    it('deve lançar erro quando pedido não existe', async () => {
      vi.mocked(mockOrderRepository.findById).mockResolvedValue(null);

      await expect(orderService.advance('999')).rejects.toThrow('Order not found');
      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar avançar pedido COMPLETED', async () => {
      const mockOrder: OrderDocument = {
        id: '123',
        lab: 'Lab A',
        patient: 'Patient A',
        customer: 'Customer A',
        state: OrderState.COMPLETED,
        status: OrderStatus.ACTIVE,
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        save: vi.fn(),
      };

      vi.mocked(mockOrderRepository.findById).mockResolvedValue(mockOrder);

      await expect(orderService.advance('123')).rejects.toThrow(
        'Order cannot advance from state COMPLETED'
      );
      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('deve listar pedidos com paginação padrão', async () => {
      const mockOrders: OrderEntity[] = [
        {
          id: '1',
          lab: 'Lab A',
          patient: 'Patient A',
          customer: 'Customer A',
          state: OrderState.CREATED,
          status: OrderStatus.ACTIVE,
          services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        },
      ];

      vi.mocked(mockOrderRepository.find).mockResolvedValue(mockOrders);

      const result = await orderService.list();

      expect(result).toEqual(mockOrders);
      expect(mockOrderRepository.find).toHaveBeenCalledWith(undefined, 1, 10);
    });

    it('deve listar pedidos filtrados por estado', async () => {
      const mockOrders: OrderEntity[] = [];

      vi.mocked(mockOrderRepository.find).mockResolvedValue(mockOrders);

      const result = await orderService.list(OrderState.COMPLETED, 2, 5);

      expect(result).toEqual(mockOrders);
      expect(mockOrderRepository.find).toHaveBeenCalledWith(OrderState.COMPLETED, 2, 5);
    });
  });
});

