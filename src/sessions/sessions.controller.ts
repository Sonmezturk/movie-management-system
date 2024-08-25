import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SessionsService } from './sessions.service';
import { Session } from './entities/sessions.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { GenericHttpErrorFilter } from 'src/httpExeptions';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
@UseFilters(new GenericHttpErrorFilter())
@ApiTags('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async create(@Body() createSessionDto: CreateSessionDto): Promise<Session> {
    return this.sessionsService.create(createSessionDto);
  }

  @Get()
  async findAll(): Promise<Session[]> {
    return this.sessionsService.findAll();
  }

  @Post('bulk-create/:movieId')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roomNumbers: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of room numbers to create sessions for',
          example: [101, 102, 103],
        },
      },
    },
  })
  async bulkCreateSessions(
    @Param('movieId') movieId: string,
    @Body('roomNumbers') roomNumbers: number[],
  ) {
    return this.sessionsService.bulkCreateSessions(movieId, roomNumbers);
  }
}
