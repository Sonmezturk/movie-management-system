import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SessionsService } from 'src/sessions/sessions.service';
import { MoviesService } from 'src/movies/movies.service';
import { Session } from 'src/sessions/entities/sessions.entity';
import { AuthService } from 'src/auth/auth.service';

describe('TicketsController (e2e)', () => {
  let app: INestApplication;
  let sessionsService: SessionsService;
  let moviesService: MoviesService;
  let authService: AuthService;
  let user;
  let session: Session;
  let ticketId;

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

    sessionsService = moduleRef.get<SessionsService>(SessionsService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    authService = moduleRef.get<AuthService>(AuthService);
    user = await authService.register({
      username: 'test+test',
      password: 'P@ssw0rd',
      age: 30,
    });

    const movie = await moviesService.createMovie({
      title: 'TICKET TEST',
      description: 'Movie description',
      ageLimit: 18,
    });

    session = await sessionsService.create({
      timeSlotId: 1,
      date: '2024-08-21',
      roomNumber: 111,
      movieId: movie.id,
    });

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/tickets (POST) - success', async () => {
    const response = await request(app.getHttpServer())
      .post('/tickets')
      .send({
        sessionId: session.id,
      })
      .set('Authorization', `Bearer ${user.access_token}`);

    ticketId = response.body.id;

    expect(response.status).toBe(201);
    expect(response.body.used).toEqual(false);
    expect(response.body.session.id).toEqual(session.id);
  });

  it('/tickets (GET) - success', async () => {
    const response = await request(app.getHttpServer()).get('/tickets');
    expect(response.status).toBe(200);
    expect(response.body[0].used).toEqual(false);
  });

  it('/tickets/:id (GET) - success', async () => {
    const response = await request(app.getHttpServer()).get(
      '/tickets/' + ticketId,
    );

    expect(response.status).toBe(200);
    expect(response.body.used).toEqual(false);
  });

  it('/tickets/:id (DELETE) - success', async () => {
    const response = await request(app.getHttpServer()).delete(
      '/tickets/' + ticketId,
    );
    expect(response.status).toBe(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
