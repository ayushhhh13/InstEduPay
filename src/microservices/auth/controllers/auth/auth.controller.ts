import { Controller, Request, Post, Body, UseGuards, Get } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from '../../dtos/login.dto';
import { RegisterDto } from '../../dtos/register.dto';
import { AuthService } from '../../services/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('generate-sign')
  async generateSign(@Body('school_id') school_id: string, @Body('collect_request_id') collect_request_id: string) {
    return this.authService.generateSign(school_id, collect_request_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}