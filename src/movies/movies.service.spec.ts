import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { SessionsService } from 'src/sessions/sessions.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('MoviesService', () => {
  let service: MoviesService;
  let repository: Repository<Movie>;
  let sessionsService: SessionsService;
  let queryBuilder: any;

  const mockMoviesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockSessionsService = {
    getBookedSessionsByMovieIds: jest.fn(),
  };

  beforeEach(async () => {
    queryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      orderBy: jest.fn(),
    };

    (mockMoviesRepository.createQueryBuilder as jest.Mock).mockReturnValue(
      queryBuilder,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMoviesRepository,
        },
        {
          provide: SessionsService,
          useValue: mockSessionsService,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    repository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
    sessionsService = module.get<SessionsService>(SessionsService);
  });

  describe('createMovie', () => {
    it('should create and save a movie', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        description: 'Description',
        ageLimit: 18,
      };
      const result = { id: '1', ...createMovieDto };

      jest.spyOn(repository, 'create').mockReturnValue(result as any);
      jest.spyOn(repository, 'save').mockResolvedValue(result as any);

      expect(await service.createMovie(createMovieDto)).toEqual(result);
    });
  });

  describe('findAllAvailableMovies', () => {
    it('should return available movies', async () => {
      const movies = [
        {
          id: '1',
          title: 'Movie 1',
          description: 'Description 1',
          ageLimit: 18,
        },
        {
          id: '2',
          title: 'Movie 2',
          description: 'Description 2',
          ageLimit: 21,
        },
      ];

      const bookedTickets = [
        { movie: { id: '1' }, timeSlot: 1 },
        { movie: { id: '1' }, timeSlot: 2 },
      ];

      jest.spyOn(queryBuilder, 'andWhere').mockReturnThis();
      jest.spyOn(queryBuilder, 'getMany').mockResolvedValue(movies as any);
      jest
        .spyOn(sessionsService, 'getBookedSessionsByMovieIds')
        .mockResolvedValue(bookedTickets as any);

      const result = await service.findAllAvailableMovies(18);
      expect(result).toEqual(movies);
    });
  });

  describe('findOneMovie', () => {
    it('should return a movie', async () => {
      const movie = {
        id: '1',
        title: 'Movie Title',
        description: 'Description',
        ageLimit: 18,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(movie as any);

      expect(await service.findOneMovie('1')).toEqual(movie);
    });
  });

  describe('updateMovie', () => {
    it('should update and return a movie', async () => {
      const updateMovieDto: UpdateMovieDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        ageLimit: 21,
      };
      const updatedMovie = { id: '1', ...updateMovieDto };

      jest.spyOn(repository, 'update').mockResolvedValue(undefined);
      jest
        .spyOn(service, 'findOneMovie')
        .mockResolvedValue(updatedMovie as any);

      expect(await service.updateMovie('1', updateMovieDto)).toEqual(
        updatedMovie,
      );
    });
  });

  describe('removeMovie', () => {
    it('should remove a movie', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

      await service.removeMovie('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('bulkCreateMovies', () => {
    it('should bulk create movies', async () => {
      const createMoviesDto: CreateMovieDto[] = [
        { title: 'Movie 1', description: 'Description 1', ageLimit: 18 },
        { title: 'Movie 2', description: 'Description 2', ageLimit: 21 },
      ];
      const movies = createMoviesDto.map((dto, index) => ({
        id: (index + 1).toString(),
        ...dto,
      }));

      jest
        .spyOn(repository, 'create')
        .mockImplementation((dto) => ({ id: '1', ...dto } as any));
      jest.spyOn(repository, 'save').mockResolvedValue(movies as any);

      expect(await service.bulkCreateMovies(createMoviesDto)).toEqual(movies);
    });
  });
});
