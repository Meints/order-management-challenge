import { OrderModel } from './order.model';
import { OrderState, CreateOrderInput, OrderEntity, OrderDocument } from './order.types';
import { AppError } from '../../shared/errors/AppError';

export interface IOrderRepository {
  create(data: CreateOrderInput): Promise<OrderEntity>;
  findById(id: string): Promise<OrderDocument | null>;
  find(state?: OrderState, page?: number, limit?: number): Promise<OrderEntity[]>;
  save(order: OrderDocument): Promise<OrderEntity>;
}

export class OrderRepository implements IOrderRepository {
  async create(data: CreateOrderInput): Promise<OrderEntity> {
    const order = await OrderModel.create(data);

    return this.toEntity(order);
  }

  async findById(id: string): Promise<OrderDocument | null> {
    const order = await OrderModel.findById(id);
    if (!order) return null;

    return this.toDocument(order);
  }

  async find(state?: OrderState, page = 1, limit = 10): Promise<OrderEntity[]> {
    const query: Record<string, string> = { status: 'ACTIVE' };

    if (state) {
      query.state = state;
    }

    const orders = await OrderModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    return orders.map((order) => this.toEntity(order));
  }

  async save(order: OrderDocument): Promise<OrderEntity> {
    const savedOrder = await OrderModel.findByIdAndUpdate(
      order.id,
      { state: order.state, status: order.status, services: order.services },
      { new: true }
    );

    if (!savedOrder) {
      throw new AppError('Failed to save order', 500);
    }

    return this.toEntity(savedOrder);
  }

  private toEntity(doc: ReturnType<typeof OrderModel.prototype.toObject>): OrderEntity {
    return {
      id: doc.id,
      lab: doc.lab,
      patient: doc.patient,
      customer: doc.customer,
      state: doc.state as OrderState,
      status: doc.status,
      services: doc.services,
    };
  }

  private toDocument(doc: ReturnType<typeof OrderModel.prototype.toObject>): OrderDocument {
    const entity = this.toEntity(doc);
    const document: OrderDocument = {
      ...entity,
      save: async (): Promise<OrderDocument> => {
        const saved = await this.save(document);
        return { ...saved, save: document.save };
      },
    };
    return document;
  }
}
