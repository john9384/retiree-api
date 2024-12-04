import {
  Controller,
  Get,
  Body,
  Put,
  Delete,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { User } from './user.model';
import { SuccessResponse } from 'library/helpers/response';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async index(@Query() query: Partial<User>, @Res() res: Response) {
    const outcome = await this.userService.readMany(query);

    return new SuccessResponse('Users fetched', outcome).send(res);
  }

  @Get(':id')
  async show(@Param('id') id: string, @Res() res: Response) {
    const outcome = await this.userService.read({ id });

    return new SuccessResponse('User fetched', outcome).send(res);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<User>,
    @Res() res: Response,
  ) {
    const outcome = await this.userService.update({ id }, body);

    return new SuccessResponse('User updated', outcome).send(res);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    const outcome = await this.userService.delete({ id });

    return new SuccessResponse('User updated', outcome).send(res);
  }
}
