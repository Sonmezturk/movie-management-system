import { Controller, Param, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/constants';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiTags('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Put(':id/role/:role')
  @ApiOperation({ summary: 'Update user role by user ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: 'string',
  })
  @ApiParam({
    name: 'role',
    description: 'New role for the user',
    enum: UserRole,
    example: UserRole.Manager,
  })
  @UseGuards(RolesGuard)
  async updateRole(@Param('id') id: string, @Param('role') role: number) {
    return this.usersService.updateUserRole(id, role);
  }
}
