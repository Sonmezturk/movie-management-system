import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let usersService: UsersService;
  let user: User;
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

    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);
    await authService.register({
      username: 'osman Sonmezturk',
      password: 'P@ssw0rd',
      age: 30,
    });
    user = (await usersService.findAll())[0];
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/users/:id/role/:role (PUT) should update the user role', async () => {
    const newRole = '2';
    const response = await request(app.getHttpServer())
      .put(`/users/${user.id}/role/${newRole}`)
      .expect(200);

    expect(response.body.role).toEqual(newRole);
  });

  afterAll(async () => {
    await app.close();
  });
});
