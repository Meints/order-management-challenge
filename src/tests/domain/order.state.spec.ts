import { describe, it, expect } from 'vitest';
import { getNextState } from '../../modules/orders/domain/order.state';
import { OrderState } from '../../modules/orders/order.types';

describe('getNextState', () => {
  it('deve avançar de CREATED para ANALYSIS', () => {
    const result = getNextState(OrderState.CREATED);

    expect(result).toBe(OrderState.ANALYSIS);
  });

  it('deve avançar de ANALYSIS para COMPLETED', () => {
    const result = getNextState(OrderState.ANALYSIS);

    expect(result).toBe(OrderState.COMPLETED);
  });

  it('deve lançar erro ao tentar avançar de COMPLETED', () => {
    expect(() => getNextState(OrderState.COMPLETED)).toThrow(
      'Order cannot advance from state COMPLETED'
    );
  });
});

