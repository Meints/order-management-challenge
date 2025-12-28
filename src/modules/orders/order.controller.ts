import { Request, Response } from 'express';
import { IOrderService } from './order.service';
import { OrderState } from './order.types';

export class OrderController {
  constructor(private readonly orderService: IOrderService) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    const order = await this.orderService.create(req.body);
    return res.status(201).json(order);
  };

  list = async (req: Request, res: Response): Promise<Response> => {
    const { state, page, limit } = req.query;

    const orders = await this.orderService.list(
      state as OrderState | undefined,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined
    );

    return res.json(orders);
  };

  advance = async (req: Request, res: Response): Promise<Response> => {
    const order = await this.orderService.advance(req.params.id);
    return res.json(order);
  };
}
