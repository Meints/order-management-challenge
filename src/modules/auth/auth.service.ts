import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { IUserRepository } from './user.repository';
import { JwtPayload, AuthResult, UserResponse } from './auth.types';
import { AppError } from '../../shared/errors/AppError';

export interface IAuthService {
  register(email: string, password: string): Promise<UserResponse>;
  login(email: string, password: string): Promise<AuthResult>;
}

export class AuthService implements IAuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async register(email: string, password: string): Promise<UserResponse> {
    const userExists = await this.userRepository.findByEmail(email);

    if (userExists) {
      throw new AppError('User already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.userRepository.create({
      email,
      password: passwordHash,
    });

    return {
      id: user.id,
      email: user.email,
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findByEmailWithPassword(email);

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return { token };
  }
}
