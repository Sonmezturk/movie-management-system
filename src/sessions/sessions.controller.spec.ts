import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { Session } from './entities/sessions.entity';
import { Movie } from 'src/movies/entities/movie.entity';

describe('SessionsController', () => {
  let controller: SessionsController;
  let service: SessionsService;

  const mockSessionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    bulkCreateSessions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        {
          provide: SessionsService,
          useValue: mockSessionsService,
        },
      ],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
    service = module.get<SessionsService>(SessionsService);
  });

  describe('create', () => {
    it('should create a new session', async () => {
      const createSessionDto: CreateSessionDto = {
        timeSlotId: 1,
        date: '',
        movieId: '',
        roomNumber: 101,
      };
      const result: Session = {
        id: '1',
        ...createSessionDto,
        movie: new Movie(),
        sessionDate: '',
        timeSlot: 1,
        booked: false,
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createSessionDto)).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return an array of sessions', async () => {
      const result: Session[] = [
        {
          id: 'b42ed27d-3af8-4328-bcb4-d9aa8e532ccc',
          sessionDate: '2024-08-24',
          timeSlot: 2,
          booked: true,
          roomNumber: 101,
          movie: new Movie(),
        },
        {
          id: 'b42ed27d-3af8-4328-bcb4-d9aa8e532ccc',
          sessionDate: '2024-08-24',
          timeSlot: 2,
          booked: true,
          roomNumber: 102,
          movie: new Movie(),
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('bulkCreateSessions', () => {
    it('should create multiple sessions for a movie', async () => {
      const movieId = 'movieId';
      const result = [
        /* list of created sessions */
      ];

      jest.spyOn(service, 'bulkCreateSessions').mockResolvedValue(result);

      expect(await controller.bulkCreateSessions(movieId, [101, 102])).toEqual(
        result,
      );
    });
  });
});
