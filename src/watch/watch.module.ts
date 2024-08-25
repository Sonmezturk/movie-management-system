import { Module } from '@nestjs/common';
import { TicketsModule } from 'src/tickets/tickets.module';
import { WatchController } from './watch.controller';
import { WatchService } from './watch.service';

@Module({
  imports: [TicketsModule],
  controllers: [WatchController],
  providers: [WatchService],
})
export class WatchModule {}
