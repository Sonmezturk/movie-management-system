import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/constants';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    updateUserRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('updateRole', () => {
    it('should update user role successfully', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const role = UserRole.Manager;
      jest
        .spyOn(usersService, 'updateUserRole')
        .mockResolvedValue({ id: userId, role } as any);

      const result = await controller.updateRole(userId, role);
      expect(result).toEqual({ id: userId, role });
      expect(usersService.updateUserRole).toHaveBeenCalledWith(userId, role);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const role = UserRole.Manager;
      jest
        .spyOn(usersService, 'updateUserRole')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.updateRole(userId, role)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
