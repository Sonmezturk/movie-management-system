import { Test, TestingModule } from '@nestjs/testing';
import { WatchController } from './watch.controller';
import { WatchService } from './watch.service';
import { NotFoundException } from '@nestjs/common';

describe('WatchController', () => {
  let controller: WatchController;
  let service: WatchService;

  const mockWatchService = {
    watchMovie: jest.fn(),
    getWatchHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchController],
      providers: [
        {
          provide: WatchService,
          useValue: mockWatchService,
        },
      ],
    }).compile();

    controller = module.get<WatchController>(WatchController);
    service = module.get<WatchService>(WatchService);
  });

  describe('markAsWatched', () => {
    it('should mark a movie as watched', async () => {
      const ticketId = '550e8400-e29b-41d4-a716-446655440000';
      jest
        .spyOn(service, 'watchMovie')
        .mockResolvedValue({ success: true } as any);

      expect(await controller.markAsWatched(ticketId)).toEqual({
        success: true,
      });
    });

    it('should throw NotFoundException if ticket not found', async () => {
      const ticketId = '550e8400-e29b-41d4-a716-446655440000';
      jest
        .spyOn(service, 'watchMovie')
        .mockRejectedValue(new NotFoundException('Ticket not found'));

      await expect(controller.markAsWatched(ticketId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getWatchHistory', () => {
    it('should return watch history for the user', async () => {
      const userId = 'user-id';
      const watchHistory = [{ id: '1', movie: 'Movie A' }];
      jest
        .spyOn(service, 'getWatchHistory')
        .mockResolvedValue(watchHistory as any);

      const req = { user: { userId } };
      expect(await controller.getWatchHistory(req)).toEqual(watchHistory);
    });

    it('should handle empty watch history', async () => {
      const userId = 'user-id';
      jest.spyOn(service, 'getWatchHistory').mockResolvedValue([] as any);

      const req = { user: { userId } };
      expect(await controller.getWatchHistory(req)).toEqual([]);
    });
  });
});
