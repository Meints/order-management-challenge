import { Request, Response } from 'express';
import { IAuthService } from './auth.service';

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  register = async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body;

    const user = await this.authService.register(email, password);
    return res.status(201).json(user);
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body;

    const result = await this.authService.login(email, password);
    return res.json(result);
  };
}
