import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { NotFoundException } from '@nestjs/common';

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: MoviesService;

  const mockMoviesService = {
    createMovie: jest.fn(),
    findAllAvailableMovies: jest.fn(),
    findOneMovie: jest.fn(),
    updateMovie: jest.fn(),
    removeMovie: jest.fn(),
    bulkCreateMovies: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get<MoviesService>(MoviesService);
  });

  describe('createMovie', () => {
    it('should create a movie', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'Movie Title',
        description: 'Description',
        ageLimit: 18,
      };
      const result = { id: '1', ...createMovieDto };

      jest.spyOn(service, 'createMovie').mockResolvedValue(result);

      expect(await controller.createMovie(createMovieDto)).toBe(result);
    });
  });

  describe('findAllMovie', () => {
    it('should return an array of movies', async () => {
      const result = [
        {
          id: '1',
          title: 'Movie Title',
          description: 'Description',
          ageLimit: 18,
        },
      ];

      jest.spyOn(service, 'findAllAvailableMovies').mockResolvedValue(result);

      expect(await controller.findAllMovie(18)).toBe(result);
    });
  });

  describe('findOneMovie', () => {
    it('should return a movie', async () => {
      const result = {
        id: '1',
        title: 'Movie Title',
        description: 'Description',
        ageLimit: 18,
      };

      jest.spyOn(service, 'findOneMovie').mockResolvedValue(result);

      expect(await controller.findOneMovie('1')).toBe(result);
    });

    it('should throw NotFoundException if movie not found', async () => {
      jest.spyOn(service, 'findOneMovie').mockResolvedValue(null);

      try {
        await controller.findOneMovie('1');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('updateMovie', () => {
    it('should update a movie', async () => {
      const updateMovieDto: UpdateMovieDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        ageLimit: 21,
      };
      const result = { id: '1', ...updateMovieDto };

      jest.spyOn(service, 'updateMovie').mockResolvedValue(result);

      expect(await controller.updateMovie('1', updateMovieDto)).toBe(result);
    });
  });

  describe('bulkCreateMovies', () => {
    it('should bulk create movies', async () => {
      const createMoviesDto: CreateMovieDto[] = [
        { title: 'Movie 1', description: 'Description 1', ageLimit: 18 },
        { title: 'Movie 2', description: 'Description 2', ageLimit: 21 },
      ];
      const result = createMoviesDto.map((dto, index) => ({
        id: (index + 1).toString(),
        ...dto,
      }));

      jest.spyOn(service, 'bulkCreateMovies').mockResolvedValue(result);

      expect(await controller.bulkCreateMovies(createMoviesDto)).toBe(result);
    });
  });
});
