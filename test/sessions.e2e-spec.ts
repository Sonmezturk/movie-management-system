import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { MoviesService } from 'src/movies/movies.service';
import { Movie } from 'src/movies/entities/movie.entity';

describe('SessionsController (e2e)', () => {
  let app: INestApplication;
  let moviesService: MoviesService;
  let movie: Movie;

  const createSessionDto = {
    timeSlotId: 4,
    date: '2024-08-21',
    roomNumber: 101,
    movieId: null,
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    moviesService = moduleRef.get<MoviesService>(MoviesService);

    movie = await moviesService.createMovie({
      title: 'SESSION TEST',
      description: 'Movie description',
      ageLimit: 18,
    });

    app = moduleRef.createNestApplication();

    await app.init();
  });

  it('/sessions (POST) - success', async () => {
    createSessionDto.movieId = movie.id;

    const response = await request(app.getHttpServer())
      .post('/sessions')
      .send(createSessionDto);

    expect(response.status).toBe(201);
    expect(response.body.timeSlot).toEqual(createSessionDto.timeSlotId);
    expect(response.body.movie.id).toEqual(movie.id);
  });

  it('/sessions (GET) - success', async () => {
    const response = await request(app.getHttpServer()).get('/sessions');
    expect(response.status).toBe(200);
    expect(response.body[0].timeSlot).toEqual(createSessionDto.timeSlotId);
    expect(response.body[0].movie.id).toEqual(movie.id);
  });

  it('/sessions/bulk-create/:movieId (POST) - success', async () => {
    const response = await request(app.getHttpServer())
      .post('/sessions/bulk-create/' + movie.id)
      .send({ roomNumbers: [101, 102, 103] });
    expect(response.status).toBe(201);
  });

  afterAll(async () => {
    await app.close();
  });
});
