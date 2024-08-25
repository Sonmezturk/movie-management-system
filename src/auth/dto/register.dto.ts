import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'osman Sonmezturk',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Strong password',
    example: 'P@ssw0rd',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 4,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  })
  password: string;

  @ApiProperty({
    description: 'Age of the user',
    example: 30,
  })
  @IsInt()
  age: number;
}
