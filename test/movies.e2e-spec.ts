import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;
  let lastId: string;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/movies (POST) - success', async () => {
    const createdMovieDto = {
      title: 'New Movie',
      description: 'Description of the movie',
      ageLimit: 18,
    };

    const response = await request(app.getHttpServer())
      .post('/movies')
      .send(createdMovieDto);
    lastId = response.body.id;

    expect(response.status).toBe(201);
    expect(response.body.title).toEqual(createdMovieDto.title);
  });

  it('/movies (GET) - success', async () => {
    const response = await request(app.getHttpServer()).get('/movies');
    expect(response.status).toBe(200);
    expect(response.body[0].title).toEqual('New Movie');
  });

  it('/movies/:id (GET) - success', async () => {
    const response = await request(app.getHttpServer()).get(
      '/movies/' + lastId,
    );
    expect(response.status).toBe(200);
    expect(response.body.title).toEqual('New Movie');
  });

  it('/movies/:id (PUT) - success', async () => {
    const updateMovieDto = {
      title: 'Updated Movie Title',
      description: 'Updated Description',
    };
    const response = await request(app.getHttpServer())
      .put('/movies/' + lastId)
      .send(updateMovieDto);
    expect(response.status).toBe(200);
    expect(response.body.title).toEqual('Updated Movie Title');
  });

  it('/movies/:id (DELETE) - success', async () => {
    const response = await request(app.getHttpServer()).delete(
      '/movies/' + lastId,
    );

    expect(response.status).toBe(204);
  });

  it('/movies/bulk-create (POST) - success', async () => {
    jest.restoreAllMocks();

    const createMoviesDto = [
      { title: 'Movie 1', description: 'Description 1', ageLimit: 18 },
      { title: 'Movie 2', description: 'Description 2', ageLimit: 15 },
    ];

    const response = await request(app.getHttpServer())
      .post('/movies')
      .send(createMoviesDto);

    expect(response.status).toBe(201);
    expect(response.body.length).toEqual(createMoviesDto.length);
  });
});
