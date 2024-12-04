import { Response, type Request } from 'express';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { SuccessResponse } from 'library/helpers/response';
import { AuthGuard } from 'library/middleware/authGuard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto, @Res() res: Response) {
    console.log(body);
    const outcome = await this.authService.register(body);

    return new SuccessResponse('Account Created', outcome).send(res);
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const outcome = await this.authService.login(body);

    return new SuccessResponse('User logged in', outcome).send(res);
  }

  @Post('current-user')
  @UseGuards(AuthGuard)
  async currentUser(@Req() req: Request, @Res() res: Response) {
    const outcome = await this.authService.currentUser(req.authId);

    return new SuccessResponse('Current user fetched', outcome).send(res);
  }

  @Get('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request, @Res() @Res() res: Response) {
    const outcome = await this.authService.logout(req.authId);

    return new SuccessResponse('User logged out', outcome).send(res);
  }
}
