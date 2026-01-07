export enum OrderState {
  CREATED = 'CREATED',
  ANALYSIS = 'ANALYSIS',
  COMPLETED = 'COMPLETED',
}

export enum OrderStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

export enum ServiceStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
}

export type ServiceInput = {
  name: string;
  value: number;
  status: ServiceStatus;
};

export type CreateOrderInput = {
  lab: string;
  patient: string;
  customer: string;
  services: ServiceInput[];
};

export type OrderEntity = {
  id?: string;
  lab: string;
  patient: string;
  customer: string;
  state: OrderState;
  status: OrderStatus;
  services: {
    name: string;
    value: number;
    status: ServiceStatus;
  }[];
};

export type OrderDocument = OrderEntity & {
  save(): Promise<OrderDocument>;
};
