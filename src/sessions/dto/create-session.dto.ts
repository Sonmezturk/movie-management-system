import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { TimeSlot } from 'src/constants';

export class CreateSessionDto {
  @ApiProperty({
    description: `Time Slot ID. Example:   
  10:00-12:00 = 1,
  12:00-14:00 = 2,
  14:00-16:00 = 3,
  16:00-18:00 = 4,
  18:00-20:00 = 5,
  20:00-22:00 = 6,
  22:00-00:00 = 7,
  example: 4,`,
  })
  @IsNumber()
  @IsEnum(TimeSlot, { each: true })
  timeSlotId: TimeSlot;

  @ApiProperty({
    description: 'Room number',
    example: '12',
  })
  @IsInt()
  roomNumber: number;

  @ApiProperty({
    description: 'Session date',
    example: '2024-08-21',
  })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Movie ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  movieId: string;
}
