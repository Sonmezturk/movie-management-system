import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  NotFoundException,
  Put,
  HttpCode,
  UseFilters,
} from '@nestjs/common';

import { Roles } from '../auth/decorator/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateMovieDto } from './dto/create-movie.dto';
import { MoviesService } from './movies.service';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { UserRole } from 'src/constants';
import { GenericHttpErrorFilter } from 'src/httpExeptions';

@Controller('movies')
@UseGuards(JwtAuthGuard)
@UseFilters(new GenericHttpErrorFilter())
@ApiTags('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Manager)
  @ApiOperation({ summary: 'Create a new movie' })
  async createMovie(@Body() createMovieDto: CreateMovieDto) {
    return await this.moviesService.createMovie(createMovieDto);
  }

  @Get()
  @ApiQuery({
    name: 'ageLimit',
    description: 'Age limit',
    type: 'integer',
    required: false,
    example: 18,
  })
  @ApiQuery({
    name: 'sortBy',
    description: 'Field to sort by (e.g., name, ageLimit)',
    type: 'string',
    required: false,
    example: 'name',
  })
  @ApiQuery({
    name: 'order',
    description: 'Order of sorting (ASC for ascending, DESC for descending)',
    type: 'string',
    required: false,
    example: 'ASC',
  })
  @ApiOperation({
    summary: 'Get all available movies with sorting and filtering',
  })
  async findAllMovie(
    @Query('ageLimit') ageLimit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
  ) {
    return this.moviesService.findAllAvailableMovies(ageLimit, sortBy, order);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'Movie ID',
    type: 'string',
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  async findOneMovie(@Param('id') id: string) {
    const movie = await this.moviesService.findOneMovie(id);
    return movie ? movie : new NotFoundException('Movie not found!');
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Manager)
  @ApiParam({
    name: 'id',
    description: 'Movie ID',
    type: 'string',
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOperation({ summary: 'Update movie by Id' })
  updateMovie(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.updateMovie(id, updateMovieDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Manager)
  @ApiParam({
    name: 'id',
    description: 'Movie ID',
    type: 'string',
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete movie by Id' })
  removeMovie(@Param('id') id: string) {
    return this.moviesService.removeMovie(id);
  }

  @Post('bulk-create')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Manager)
  @ApiOperation({ summary: 'Bulk movie create' })
  async bulkCreateMovies(@Body() createMoviesDto: CreateMovieDto[]) {
    return this.moviesService.bulkCreateMovies(createMoviesDto);
  }
}
