import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from 'src/constants';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
        age: 30,
      };
      const user = { id: '1', ...createUserDto };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(user as any);
      jest.spyOn(repository, 'save').mockResolvedValue(user as any);

      expect(await service.createUser(createUserDto)).toEqual(user);
    });

    it('should throw an error if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
        age: 30,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(createUserDto as any);

      await expect(service.createUser(createUserDto)).rejects.toThrowError(
        'user exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        {
          id: '1',
          username: 'testuser',
          password: 'password123',
          age: 30,
          role: UserRole.Customer,
        },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(users as any);

      expect(await service.findAll()).toEqual(users);
    });
  });

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      const user = {
        id: '1',
        username: 'testuser',
        password: 'password123',
        age: 30,
        role: UserRole.Customer,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(user as any);

      expect(await service.findOneById('1')).toEqual(user);
    });
  });

  describe('findOneByUsername', () => {
    it('should return a user by username', async () => {
      const user = {
        id: '1',
        username: 'testuser',
        password: 'password123',
        age: 30,
        role: UserRole.Customer,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(user as any);

      expect(await service.findOneByUsername('testuser')).toEqual(user);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const user = {
        id: '1',
        username: 'testuser',
        password: 'password123',
        age: 30,
        role: UserRole.Customer,
      };
      const updatedUser = { ...user, role: UserRole.Manager };
      jest.spyOn(repository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedUser as any);

      expect(await service.updateUserRole('1', UserRole.Manager)).toEqual(
        updatedUser,
      );
    });
  });
});
