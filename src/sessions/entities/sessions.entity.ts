import { TimeSlot } from 'src/constants';
import { Movie } from 'src/movies/entities/movie.entity';
import {
  Entity,
  Column,
  ManyToOne,
  Unique,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Unique(['sessionDate', 'roomNumber', 'timeSlot'])
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Movie, (movie) => movie.id, { onDelete: 'CASCADE' })
  movie: Movie;

  @Column()
  roomNumber: number;

  @Column()
  sessionDate: string;

  @Column()
  timeSlot: TimeSlot;

  @Column({ default: false })
  booked: boolean;
}
