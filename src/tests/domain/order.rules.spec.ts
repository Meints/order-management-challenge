import { describe, it, expect } from 'vitest';
import { validateServices } from '../../modules/orders/domain/order.rules';
import { ServiceInput, ServiceStatus } from '../../modules/orders/order.types';

describe('validateServices', () => {
  it('deve lançar erro quando services é undefined', () => {
    expect(() => validateServices(undefined as unknown as ServiceInput[])).toThrow(
      'Order must have at least one service'
    );
  });

  it('deve lançar erro quando services é array vazio', () => {
    expect(() => validateServices([])).toThrow('Order must have at least one service');
  });

  it('deve lançar erro quando valor total é zero', () => {
    const services: ServiceInput[] = [
      { name: 'Service 1', value: 0, status: ServiceStatus.PENDING },
    ];

    expect(() => validateServices(services)).toThrow(
      'Order total value must be greater than zero'
    );
  });

  it('deve lançar erro quando valor total é negativo', () => {
    const services: ServiceInput[] = [
      { name: 'Service 1', value: -100, status: ServiceStatus.PENDING },
    ];

    expect(() => validateServices(services)).toThrow(
      'Order total value must be greater than zero'
    );
  });

  it('deve passar quando services tem valor total positivo', () => {
    const services: ServiceInput[] = [
      { name: 'Service 1', value: 100, status: ServiceStatus.PENDING },
      { name: 'Service 2', value: 50, status: ServiceStatus.PENDING },
    ];

    expect(() => validateServices(services)).not.toThrow();
  });

  it('deve passar quando um único serviço tem valor positivo', () => {
    const services: ServiceInput[] = [{ name: 'Service 1', value: 1 }];

    expect(() => validateServices(services)).not.toThrow();
  });
});

