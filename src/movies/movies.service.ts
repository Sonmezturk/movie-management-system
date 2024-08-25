import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { SessionsService } from 'src/sessions/sessions.service';
import { TimeSlot } from 'src/constants';

@Injectable()
export class MoviesService {
  constructor(
    private readonly sessionsService: SessionsService,
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

  async createMovie(createMovieDto: CreateMovieDto): Promise<Movie> {
    const movie = this.moviesRepository.create(createMovieDto);
    return this.moviesRepository.save(movie);
  }

  async findAllAvailableMovies(
    ageLimit?: number,
    sortBy = 'title',
    order: 'ASC' | 'DESC' = 'ASC',
  ): Promise<Movie[]> {
    const queryBuilder = await this.moviesRepository.createQueryBuilder(
      'movie',
    );

    if (ageLimit) {
      queryBuilder.andWhere('movie.ageLimit >= :ageLimit', {
        ageLimit: ageLimit,
      });
    }
    queryBuilder.orderBy(`movie.${sortBy}`, order);

    const movies = await queryBuilder.getMany();
    const bookedTickets =
      await this.sessionsService.getBookedSessionsByMovieIds(
        movies.map((movie) => movie.id),
      );

    const bookedTimeSlotsMap = new Map<string, Set<TimeSlot>>();
    bookedTickets.forEach((ticket) => {
      const { id: movieId } = ticket.movie;
      if (!bookedTimeSlotsMap.has(movieId)) {
        bookedTimeSlotsMap.set(movieId, new Set());
      }
      bookedTimeSlotsMap.get(movieId).add(ticket.timeSlot);
    });

    const allTimeSlots: TimeSlot[] = [1, 2, 3, 4, 5, 6, 7];
    const availableMovies = movies.filter((movie) => {
      const bookedSlots = bookedTimeSlotsMap.get(movie.id) || new Set();
      return allTimeSlots.some((slot) => !bookedSlots.has(slot));
    });

    return availableMovies;
  }

  async findOneMovie(id: string): Promise<Movie> {
    return this.moviesRepository.findOne({
      where: { id },
    });
  }

  async updateMovie(
    id: string,
    updateMovieDto: UpdateMovieDto,
  ): Promise<Movie> {
    await this.moviesRepository.update(id, updateMovieDto);
    return this.findOneMovie(id);
  }

  async removeMovie(id: string): Promise<void> {
    await this.moviesRepository.delete(id);
  }

  async bulkCreateMovies(createMoviesDto: CreateMovieDto[]): Promise<Movie[]> {
    const movies = createMoviesDto.map((dto) =>
      this.moviesRepository.create(dto),
    );
    return this.moviesRepository.save(movies);
  }
}
