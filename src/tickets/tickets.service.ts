import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/tickets.entity';
import { UsersService } from 'src/users/users.service';
import { SessionsService } from 'src/sessions/sessions.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
  ) {}

  async create(createTicketDto: {
    sessionId: string;
    userId: string;
  }): Promise<Ticket> {
    const { userId, sessionId } = createTicketDto;
    const [user, session] = await Promise.all([
      this.usersService.findOneById(userId),
      this.sessionsService.findById(sessionId),
    ]);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    const ticket = this.ticketsRepository.create({
      user,
      session,
    });
    await this.sessionsService.updateBookedStatus(sessionId, true);

    return this.ticketsRepository.save(ticket);
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find();
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  async updateUsedById(id: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ id });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.used = true;
    return this.ticketsRepository.save(ticket);
  }

  async getWatchHistory(userId: string): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      where: { user: { id: userId }, used: true },
      relations: ['session', 'session.movie'],
    });
  }

  async remove(id: string): Promise<void> {
    await this.ticketsRepository.delete(id);
  }
}
