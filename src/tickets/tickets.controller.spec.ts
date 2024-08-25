import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { NotFoundException } from '@nestjs/common';

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: TicketsService;

  const mockTicketsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get<TicketsService>(TicketsService);
  });

  describe('create', () => {
    it('should create a ticket with userId from request', async () => {
      const createTicketDto: CreateTicketDto = {
        sessionId: 'session-id',
      };
      const userId = 'user-id';
      const createdTicket = {
        id: 'ticket-id',
        user: { id: userId },
        session: { id: createTicketDto.sessionId },
        purchaseDate: new Date(),
        used: false,
        ...createTicketDto,
        userId: userId,
      };

      jest.spyOn(service, 'create').mockResolvedValue(createdTicket as any);

      const result = await controller.create(createTicketDto, {
        user: { userId },
      } as any);
      expect(result).toEqual(createdTicket);
      expect(service.create).toHaveBeenCalledWith({
        ...createTicketDto,
        userId,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of tickets', async () => {
      const tickets = [
        {
          id: 'ticket-id-1',
          user: { id: 'user-id-1' },
          session: { id: 'session-id-1' },
          purchaseDate: new Date(),
          used: false,
        },
        {
          id: 'ticket-id-2',
          user: { id: 'user-id-2' },
          session: { id: 'session-id-2' },
          purchaseDate: new Date(),
          used: false,
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(tickets as any);

      expect(await controller.findAll()).toEqual(tickets);
    });
  });

  describe('findOne', () => {
    it('should return a ticket by ID', async () => {
      const ticket = {
        id: 'ticket-id',
        user: { id: 'user-id' },
        session: { id: 'session-id' },
        purchaseDate: new Date(),
        used: false,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(ticket as any);

      expect(await controller.findOne('ticket-id')).toEqual(ticket);
    });
  });

  describe('remove', () => {
    it('should remove a ticket by ID', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await expect(controller.remove('ticket-id')).resolves.not.toThrow();
    });

    it('should throw NotFoundException if ticket not found', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new NotFoundException('Ticket not found'));

      await expect(controller.remove('ticket-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
