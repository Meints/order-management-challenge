import { Schema, model } from 'mongoose';
import { OrderState, OrderStatus, ServiceStatus } from './order.types';

const ServiceSchema = new Schema(
  {
    name: { type: String, required: true },
    value: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(ServiceStatus),
      default: ServiceStatus.PENDING,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    lab: { type: String, required: true },
    patient: { type: String, required: true },
    customer: { type: String, required: true },

    state: {
      type: String,
      enum: Object.values(OrderState),
      default: OrderState.CREATED,
    },

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.ACTIVE,
    },

    services: {
      type: [ServiceSchema],
      required: true,
    },
  },
  { timestamps: true }
);

export const OrderModel = model('Order', OrderSchema);
