import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Movie } from 'src/movies/entities/movie.entity';
import { Ticket } from 'src/tickets/entities/tickets.entity';
import { Session } from 'src/sessions/entities/sessions.entity';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        if (process.env.NODE_ENV === 'test') {
          const container = await new PostgreSqlContainer(
            'postgres:16-alpine',
          ).start();
          const uri = container.getConnectionUri();
          return {
            type: 'postgres',
            url: uri,
            entities: [User, Movie, Ticket, Session],
            autoLoadEntities: true,
            synchronize: true,
          };
        }

        return {
          type: 'postgres',
          url: configService.get<string>('DB_URL'),
          entities: [User, Movie, Ticket, Session],
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
  ],
  providers: [ConfigService],
})
export class DatabaseModule {}
