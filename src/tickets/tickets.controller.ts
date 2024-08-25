import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  UseFilters,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { GenericHttpErrorFilter } from 'src/httpExeptions';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
@UseFilters(new GenericHttpErrorFilter())
@ApiTags('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto, @Req() req) {
    return this.ticketsService.create({
      ...createTicketDto,
      userId: req.user?.userId,
    });
  }

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    type: 'string',
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    type: 'string',
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
