import { UserModel } from './user.model';
import { UserEntity } from './auth.types';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findByEmailWithPassword(email: string): Promise<UserEntity | null>;
  create(data: { email: string; password: string }): Promise<UserEntity>;
}

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      password: '',
    };
  }

  async findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      password: user.password,
    };
  }

  async create(data: { email: string; password: string }): Promise<UserEntity> {
    const user = await UserModel.create(data);

    return {
      id: user.id,
      email: user.email,
      password: '',
    };
  }
}
