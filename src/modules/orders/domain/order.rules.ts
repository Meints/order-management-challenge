import { ServiceInput } from '../order.types';
import { AppError } from '../../../shared/errors/AppError';

export function validateServices(services: ServiceInput[]) {
  if (!services || services.length === 0) {
    throw new AppError('Order must have at least one service', 400);
  }

  const total = services.reduce((sum, service) => sum + service.value, 0);

  if (total <= 0) {
    throw new AppError('Order total value must be greater than zero', 400);
  }
}
