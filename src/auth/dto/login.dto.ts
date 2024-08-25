import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Username',
    example: 'osman Sonmezturk',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password',
    example: 'P@ssw0rd',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
