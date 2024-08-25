import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AppModule } from 'src/app.module';
import { SessionsService } from 'src/sessions/sessions.service';
import { MoviesService } from 'src/movies/movies.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { TicketsService } from 'src/tickets/tickets.service';
import { Ticket } from 'src/tickets/entities/tickets.entity';
import { User } from 'src/users/entities/user.entity';
import { Session } from 'src/sessions/entities/sessions.entity';
import { Movie } from 'src/movies/entities/movie.entity';

describe('WatchController', () => {
  let app: INestApplication;
  let ticketsService: TicketsService;
  let sessionsService: SessionsService;
  let moviesService: MoviesService;
  let authService: AuthService;
  let usersService: UsersService;
  let user: User;
  let session: Session;
  let ticket: Ticket;
  let movie: Movie;
  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    sessionsService = moduleRef.get<SessionsService>(SessionsService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);
    ticketsService = moduleRef.get<TicketsService>(TicketsService);
    await authService.register({
      username: 'osman Sonmezturk',
      password: 'P@ssw0rd',
      age: 30,
    });
    user = (await usersService.findAll())[0];

    movie = await moviesService.createMovie({
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

    ticket = await ticketsService.create({
      sessionId: session.id,
      userId: user.id,
    });

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/watch/:ticketId (POST) - success', async () => {
    const response = await request(app.getHttpServer()).post(
      '/watch/' + ticket.id,
    );

    expect(response.status).toBe(201);
    expect(response.body.used).toEqual(true);
  });

  it('/watch/history (GET) - success', async () => {
    const response = await request(app.getHttpServer()).get('/watch/history');

    expect(response.status).toBe(200);
    expect(response.body[0].used).toEqual(true);
    expect(response.body[0].id).toEqual(ticket.id);
    expect(response.body[0].session.id).toEqual(session.id);
    expect(response.body[0].session.movie.id).toEqual(movie.id);
  });

  afterAll(async () => {
    await app.close();
  });
});
