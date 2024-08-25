import { Test, TestingModule } from '@nestjs/testing';
import { WatchService } from './watch.service';
import { TicketsService } from 'src/tickets/tickets.service';
import { NotFoundException } from '@nestjs/common';
import { Ticket } from 'src/tickets/entities/tickets.entity';

describe('WatchService', () => {
  let service: WatchService;
  let ticketsService: TicketsService;

  const mockTicketsService = {
    updateUsedById: jest.fn(),
    getWatchHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchService,
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
      ],
    }).compile();

    service = module.get<WatchService>(WatchService);
    ticketsService = module.get<TicketsService>(TicketsService);
  });

  describe('watchMovie', () => {
    it('should mark a ticket as used', async () => {
      const ticketId = '550e8400-e29b-41d4-a716-446655440000';
      const ticket = { id: ticketId, used: true } as Ticket;
      jest.spyOn(ticketsService, 'updateUsedById').mockResolvedValue(ticket);

      expect(await service.watchMovie(ticketId)).toEqual(ticket);
      expect(ticketsService.updateUsedById).toHaveBeenCalledWith(ticketId);
    });

    it('should throw error if ticket not found', async () => {
      const ticketId = '550e8400-e29b-41d4-a716-446655440000';
      jest
        .spyOn(ticketsService, 'updateUsedById')
        .mockRejectedValue(new NotFoundException('Ticket not found'));

      await expect(service.watchMovie(ticketId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getWatchHistory', () => {
    it('should return watch history for the user', async () => {
      const userId = 'user-id';
      const watchHistory = [{ id: '1', used: true } as Ticket];
      jest
        .spyOn(ticketsService, 'getWatchHistory')
        .mockResolvedValue(watchHistory);

      expect(await service.getWatchHistory(userId)).toEqual(watchHistory);
      expect(ticketsService.getWatchHistory).toHaveBeenCalledWith(userId);
    });

    it('should handle empty watch history', async () => {
      const userId = 'user-id';
      jest.spyOn(ticketsService, 'getWatchHistory').mockResolvedValue([]);

      expect(await service.getWatchHistory(userId)).toEqual([]);
    });
  });
});
