import { Session } from 'src/sessions/entities/sessions.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Session, (session) => session.id, {
    onDelete: 'CASCADE',
  })
  session: Session;

  @CreateDateColumn()
  purchaseDate: Date;

  @Column({ default: false })
  used: boolean;
}
