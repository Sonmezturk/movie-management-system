import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from './entities/tickets.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { SessionsService } from 'src/sessions/sessions.service';
import { NotFoundException } from '@nestjs/common';

describe('TicketsService', () => {
  let service: TicketsService;
  let ticketsRepository: Repository<Ticket>;
  let usersService: UsersService;
  let sessionsService: SessionsService;

  const mockTicketsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  const mockUsersService = {
    findOneById: jest.fn(),
  };

  const mockSessionsService = {
    findById: jest.fn(),
    updateBookedStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: mockTicketsRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: SessionsService,
          useValue: mockSessionsService,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    ticketsRepository = module.get<Repository<Ticket>>(
      getRepositoryToken(Ticket),
    );
    usersService = module.get<UsersService>(UsersService);
    sessionsService = module.get<SessionsService>(SessionsService);
  });

  describe('create', () => {
    it('should create and return a ticket', async () => {
      const createTicketDto = { sessionId: 'session-id', userId: 'user-id' };
      const user = { id: 'user-id' };
      const session = { id: 'session-id' };
      const ticket = { id: 'ticket-id', user, session };

      jest.spyOn(usersService, 'findOneById').mockResolvedValue(user as any);
      jest.spyOn(sessionsService, 'findById').mockResolvedValue(session as any);
      jest.spyOn(ticketsRepository, 'create').mockReturnValue(ticket as any);
      jest.spyOn(ticketsRepository, 'save').mockResolvedValue(ticket as any);
      jest
        .spyOn(sessionsService, 'updateBookedStatus')
        .mockResolvedValue(undefined);

      expect(await service.create(createTicketDto)).toEqual(ticket);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(null);
      jest.spyOn(sessionsService, 'findById').mockResolvedValue({} as any);

      await expect(
        service.create({ sessionId: 'session-id', userId: 'user-id' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if session is not found', async () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue({} as any);
      jest.spyOn(sessionsService, 'findById').mockResolvedValue(null);

      await expect(
        service.create({ sessionId: 'session-id', userId: 'user-id' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of tickets', async () => {
      const tickets = [{ id: 'ticket-id' }];
      jest.spyOn(ticketsRepository, 'find').mockResolvedValue(tickets as any);

      expect(await service.findAll()).toEqual(tickets);
    });
  });

  describe('findOne', () => {
    it('should return a ticket by ID', async () => {
      const ticket = { id: 'ticket-id' };
      jest.spyOn(ticketsRepository, 'findOne').mockResolvedValue(ticket as any);

      expect(await service.findOne('ticket-id')).toEqual(ticket);
    });

    it('should throw NotFoundException if ticket not found', async () => {
      jest.spyOn(ticketsRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('ticket-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUsedById', () => {
    it('should update the ticket as used', async () => {
      const ticket = { id: 'ticket-id', used: false };
      jest
        .spyOn(ticketsRepository, 'findOneBy')
        .mockResolvedValue(ticket as any);
      jest
        .spyOn(ticketsRepository, 'save')
        .mockResolvedValue({ ...ticket, used: true } as any);

      expect(await service.updateUsedById('ticket-id')).toEqual({
        ...ticket,
        used: true,
      });
    });

    it('should throw NotFoundException if ticket not found', async () => {
      jest.spyOn(ticketsRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.updateUsedById('ticket-id')).rejects.toThrow(
        'Ticket not found',
      );
    });
  });

  describe('getWatchHistory', () => {
    it('should return an array of tickets for a user', async () => {
      const tickets = [{ id: 'ticket-id' }];
      jest.spyOn(ticketsRepository, 'find').mockResolvedValue(tickets as any);

      expect(await service.getWatchHistory('user-id')).toEqual(tickets);
    });
  });
});
