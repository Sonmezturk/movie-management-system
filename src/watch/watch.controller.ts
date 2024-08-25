import { Controller, Post, Get, Param, UseGuards, Req } from '@nestjs/common';
import { WatchService } from './watch.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@Controller('watch')
@UseGuards(JwtAuthGuard)
@ApiTags('watch')
export class WatchController {
  constructor(private readonly watchService: WatchService) {}

  @Post(':ticketId')
  @ApiParam({
    name: 'ticketId',
    description: 'Ticket ID',
    type: 'string',
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  async markAsWatched(@Param('ticketId') ticketId: string) {
    return this.watchService.watchMovie(ticketId);
  }

  @Get('history')
  async getWatchHistory(@Req() req) {
    return this.watchService.getWatchHistory(req.user?.userId);
  }
}
