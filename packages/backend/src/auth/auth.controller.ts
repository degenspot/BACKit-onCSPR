import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { wallet: string }) {
    const user = await this.authService.validateUser(body.wallet);
    return user;
  }
}
