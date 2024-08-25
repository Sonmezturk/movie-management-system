import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Session } from './entities/sessions.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { MoviesService } from 'src/movies/movies.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    @Inject(forwardRef(() => MoviesService))
    private readonly moviesService: MoviesService,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const movie = await this.moviesService.findOneMovie(
      createSessionDto.movieId,
    );
    if (!movie) {
      throw new NotFoundException(
        `Movie with ID ${createSessionDto.movieId} not found`,
      );
    }

    const session = this.sessionsRepository.create({
      movie: movie,
      sessionDate: createSessionDto.date,
      timeSlot: createSessionDto.timeSlotId,
      roomNumber: createSessionDto.roomNumber,
    });
    return await this.sessionsRepository.save(session);
  }

  async findAll(): Promise<Session[]> {
    return await this.sessionsRepository.find({ relations: ['movie'] });
  }

  async findById(id: string): Promise<Session> {
    const session = await this.sessionsRepository.findOne({
      where: { id },
      relations: ['movie'],
    });
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    return session;
  }

  async updateBookedStatus(
    sessionId: string,
    booked: boolean,
  ): Promise<Session> {
    const session = await this.sessionsRepository.findOneBy({ id: sessionId });

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }
    if (session.booked) {
      throw new BadRequestException(`Session already booked`);
    }
    session.booked = booked;
    return this.sessionsRepository.save(session);
  }

  async getBookedSessionsByMovieIds(movieIds: string[]): Promise<Session[]> {
    return this.sessionsRepository.find({
      where: {
        movie: { id: In(movieIds) },
        booked: true,
      },
      relations: ['movie'],
    });
  }

  async bulkCreateSessions(
    movieId: string,
    roomNumbers: number[],
  ): Promise<Session[]> {
    const movie = await this.moviesService.findOneMovie(movieId);
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    const sessions = roomNumbers.map((roomNumber, index) => {
      const sessionDate = new Date().toISOString().split('T')[0];
      const timeSlot = index + 1;

      const session = this.sessionsRepository.create({
        movie,
        roomNumber,
        sessionDate,
        timeSlot,
        booked: false,
      });

      return session;
    });

    return await this.sessionsRepository.save(sessions);
  }
}
