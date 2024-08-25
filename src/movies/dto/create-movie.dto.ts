import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPositive } from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({
    description: 'Movie title',
    example: 'Movie Title',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Movie description',
    example: 'Movie description',
    required: false,
  })
  description: string;

  @ApiProperty({
    description: 'Age restriction',
    example: 18,
  })
  @IsPositive()
  @IsNotEmpty()
  ageLimit: number;
}
