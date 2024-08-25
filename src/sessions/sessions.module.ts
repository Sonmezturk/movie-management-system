import { forwardRef, Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Session } from './entities/sessions.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesModule } from 'src/movies/movies.module';
import { SessionsController } from './sessions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    forwardRef(() => MoviesModule),
  ],
  providers: [SessionsService],
  exports: [SessionsService],
  controllers: [SessionsController],
})
export class SessionsModule {}
