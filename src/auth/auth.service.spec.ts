import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { ForbiddenException } from '@nestjs/common';

const mockUsersService = {
  findOneByUsername: jest.fn(),
  createUser: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('secret'),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return a token if credentials are correct', async () => {
      const loginDto = { username: 'test', password: 'password' };
      const user = {
        id: 'user-id',
        username: 'test',
        password: await argon.hash('password'),
      };

      mockUsersService.findOneByUsername.mockResolvedValue(user);
      jest.spyOn(argon, 'verify').mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await authService.login(loginDto);

      expect(result).toEqual({ access_token: 'token' });
      expect(mockUsersService.findOneByUsername).toHaveBeenCalledWith(
        loginDto.username,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { userId: user.id },
        { secret: 'secret', expiresIn: '30m' },
      );
    });

    it('should throw a ForbiddenException if credentials are incorrect', async () => {
      const loginDto = { username: 'test', password: 'password' };

      mockUsersService.findOneByUsername.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('register', () => {
    it('should return a token after registering a user', async () => {
      const registerDto = { username: 'test', password: 'password', age: 25 };
      const hashedPassword = await argon.hash(registerDto.password);
      const user = {
        id: 'user-id',
        username: registerDto.username,
        password: hashedPassword,
      };

      mockUsersService.createUser.mockResolvedValue(user);
      jest.spyOn(argon, 'hash').mockResolvedValue(hashedPassword);
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await authService.register(registerDto);

      expect(result).toEqual({ access_token: 'token' });
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        username: registerDto.username,
        password: hashedPassword,
        age: registerDto.age,
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { userId: user.id },
        { secret: 'secret', expiresIn: '30m' },
      );
    });
  });

  describe('signToken', () => {
    it('should return a token', async () => {
      const userId = 'user-id';
      mockJwtService.signAsync.mockResolvedValue('token');
      mockConfigService.get.mockReturnValue('secret');

      const result = await authService.signToken(userId);

      expect(result).toEqual({ access_token: 'token' });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { userId },
        { secret: 'secret', expiresIn: '30m' },
      );
    });
  });
});
