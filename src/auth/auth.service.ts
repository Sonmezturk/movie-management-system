import { ForbiddenException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwt: JwtService,
    private cfgService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.findOneByUsername(loginDto.username);
    if (user) {
      const isEqual = await argon.verify(user.password, loginDto.password);
      if (isEqual) {
        return this.signToken(user.id);
      }
    }
    throw new ForbiddenException('Incorrect email or password!');
  }

  async register(registerDto: RegisterDto) {
    const hash = await argon.hash(registerDto.password);
    const user = await this.userService.createUser({
      username: registerDto.username,
      password: hash,
      age: registerDto.age,
    });
    return this.signToken(user.id);
  }

  async signToken(userId: string) {
    const payload = {
      userId,
    };

    const token = await this.jwt.signAsync(payload, {
      secret: this.cfgService.get('JWT_SECRET'),
      expiresIn: '30m',
    });

    return {
      access_token: token,
    };
  }
}
