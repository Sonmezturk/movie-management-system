import { Injectable } from '@nestjs/common';
import { Ticket } from 'src/tickets/entities/tickets.entity';
import { TicketsService } from 'src/tickets/tickets.service';

@Injectable()
export class WatchService {
  constructor(private readonly ticketsService: TicketsService) {}

  async watchMovie(ticketId: string): Promise<Ticket> {
    return this.ticketsService.updateUsedById(ticketId);
  }

  async getWatchHistory(userId: string): Promise<Ticket[]> {
    return this.ticketsService.getWatchHistory(userId);
  }
}
