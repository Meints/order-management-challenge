import { OrderState } from '../order.types';
import { AppError } from '../../../shared/errors/AppError';

const stateFlow: Record<OrderState, OrderState | null> = {
  [OrderState.CREATED]: OrderState.ANALYSIS,
  [OrderState.ANALYSIS]: OrderState.COMPLETED,
  [OrderState.COMPLETED]: null,
};

export function getNextState(currentState: OrderState): OrderState {
  const next = stateFlow[currentState];

  if (!next) {
    throw new AppError(`Order cannot advance from state ${currentState}`, 400);
  }

  return next;
}
