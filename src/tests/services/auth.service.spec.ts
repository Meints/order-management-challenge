import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IUserRepository } from '../../modules/auth/user.repository';
import { UserEntity } from '../../modules/auth/auth.types';

vi.mock('../../config/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key',
    MONGO_URI: 'mongodb://localhost:27017/test',
    PORT: 3000,
  },
}));

const mockUserRepository: IUserRepository = {
  findByEmail: vi.fn(),
  findByEmailWithPassword: vi.fn(),
  create: vi.fn(),
};

describe('AuthService', () => {
  let authService: InstanceType<typeof import('../../modules/auth/auth.service').AuthService>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { AuthService } = await import('../../modules/auth/auth.service');
    authService = new AuthService(mockUserRepository);
  });

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const mockUser: UserEntity = {
        id: '123',
        email: 'test@test.com',
        password: '',
      };

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);

      const result = await authService.register('test@test.com', 'password123');

      expect(result).toEqual({
        id: '123',
        email: 'test@test.com',
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@test.com');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: expect.any(String),
      });
    });

    it('deve lançar erro quando usuário já existe', async () => {
      const existingUser: UserEntity = {
        id: '123',
        email: 'test@test.com',
        password: 'hash',
      };

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);

      await expect(authService.register('test@test.com', 'password123')).rejects.toThrow(
        'User already exists'
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso e retornar token', async () => {
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);

      const mockUser: UserEntity = {
        id: '123',
        email: 'test@test.com',
        password: hashedPassword,
      };

      vi.mocked(mockUserRepository.findByEmailWithPassword).mockResolvedValue(mockUser);

      const result = await authService.login('test@test.com', 'password123');

      expect(result).toHaveProperty('token');
      expect(typeof result.token).toBe('string');
      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith('test@test.com');
    });

    it('deve lançar erro quando usuário não existe', async () => {
      vi.mocked(mockUserRepository.findByEmailWithPassword).mockResolvedValue(null);

      await expect(authService.login('test@test.com', 'password123')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('deve lançar erro quando senha está incorreta', async () => {
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      const mockUser: UserEntity = {
        id: '123',
        email: 'test@test.com',
        password: hashedPassword,
      };

      vi.mocked(mockUserRepository.findByEmailWithPassword).mockResolvedValue(mockUser);

      await expect(authService.login('test@test.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });
});

