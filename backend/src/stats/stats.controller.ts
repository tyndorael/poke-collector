import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatsService } from './stats.service';
import { UserStatsDto } from '../users/dto/user-stats.dto';

@ApiTags('📊 User Statistics')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user dashboard statistics' })
  @ApiResponse({ status: 200, description: 'User statistics.', type: UserStatsDto })
  async getUserStats(@Request() req: ExpressRequest & { user: { userId: string } }) {
    // The userId is obtained from the JWT token payload
    return this.statsService.getUserDashboardStats(req.user.userId);
  }
}
