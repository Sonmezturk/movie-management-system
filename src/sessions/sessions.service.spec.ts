import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SessionsService } from './sessions.service';
import { Session } from './entities/sessions.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { MoviesService } from 'src/movies/movies.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('SessionsService', () => {
  let service: SessionsService;
  let repository: Repository<Session>;
  let moviesService: MoviesService;

  const mockSessionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  const mockMoviesService = {
    findOneMovie: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: getRepositoryToken(Session),
          useValue: mockSessionRepository,
        },
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    repository = module.get<Repository<Session>>(getRepositoryToken(Session));
    moviesService = module.get<MoviesService>(MoviesService);
  });

  describe('create', () => {
    it('should create and save a session', async () => {
      const createSessionDto: CreateSessionDto = {
        movieId: '1',
        date: '2024-08-24',
        timeSlotId: 1,
        roomNumber: 101,
      };
      const movie = { id: '1', title: 'Movie Title' };
      const session = { id: '1', ...createSessionDto, movie };

      jest.spyOn(moviesService, 'findOneMovie').mockResolvedValue(movie as any);
      jest.spyOn(repository, 'create').mockReturnValue(session as any);
      jest.spyOn(repository, 'save').mockResolvedValue(session as any);

      expect(await service.create(createSessionDto)).toEqual(session);
    });

    it('should throw NotFoundException if movie not found', async () => {
      const createSessionDto: CreateSessionDto = {
        movieId: '1',
        date: '2024-08-24',
        timeSlotId: 1,
        roomNumber: 101,
      };

      jest.spyOn(moviesService, 'findOneMovie').mockResolvedValue(null);

      await expect(service.create(createSessionDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of sessions', async () => {
      const sessions = [
        { id: '1', movie: { id: '1' }, sessionDate: '2024-08-24', timeSlot: 1 },
        { id: '2', movie: { id: '2' }, sessionDate: '2024-08-24', timeSlot: 2 },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(sessions as any);

      expect(await service.findAll()).toEqual(sessions);
    });
  });

  describe('findById', () => {
    it('should return a session by ID', async () => {
      const session = {
        id: '1',
        movie: { id: '1' },
        sessionDate: '2024-08-24',
        timeSlot: 1,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(session as any);

      expect(await service.findById('1')).toEqual(session);
    });

    it('should throw NotFoundException if session not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBookedStatus', () => {
    it('should update the booked status of a session', async () => {
      const session = { id: '1', booked: false };
      const updatedSession = { ...session, booked: true };

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(session as any);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedSession as any);

      expect(await service.updateBookedStatus('1', true)).toEqual(
        updatedSession,
      );
    });

    it('should throw NotFoundException if session not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.updateBookedStatus('1', true)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if session is already booked', async () => {
      const session = { id: '1', booked: true };

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(session as any);

      await expect(service.updateBookedStatus('1', true)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getBookedSessionsByMovieIds', () => {
    it('should return booked sessions by movie IDs', async () => {
      const sessions = [
        { id: '1', movie: { id: '1' }, booked: true },
        { id: '2', movie: { id: '1' }, booked: true },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(sessions as any);

      expect(await service.getBookedSessionsByMovieIds(['1'])).toEqual(
        sessions,
      );
    });
  });

  describe('bulkCreateSessions', () => {
    it('should create multiple sessions for a movie', async () => {
      const movieId = '1';
      const movie = { id: '1', title: 'Movie Title' };
      const sessions = [
        {
          movie,
          sessionDate: new Date().toISOString().split('T')[0],
          timeSlot: 1,
          booked: false,
        },
        {
          movie,
          sessionDate: new Date().toISOString().split('T')[0],
          timeSlot: 2,
          booked: false,
        },
      ];

      jest.spyOn(moviesService, 'findOneMovie').mockResolvedValue(movie as any);
      jest
        .spyOn(repository, 'create')
        .mockImplementation((dto) => ({ ...dto, id: '1' } as any));
      jest.spyOn(repository, 'save').mockResolvedValue(sessions as any);

      expect(await service.bulkCreateSessions(movieId, [101, 102])).toEqual(
        sessions,
      );
    });

    it('should throw NotFoundException if movie not found', async () => {
      const movieId = '1';

      jest.spyOn(moviesService, 'findOneMovie').mockResolvedValue(null);

      await expect(
        service.bulkCreateSessions(movieId, [101, 102]),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
