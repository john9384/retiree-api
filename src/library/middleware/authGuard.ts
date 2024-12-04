import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import logger from '../helpers/logger';
import { TokenExpiredError } from 'library/helpers/errors';
import JWT, { validateTokenData } from 'library/helpers/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (!request.header('Authorization')) {
      logger.error('Token not supplied');
      throw new TokenExpiredError('Token has Expired');
    }
    try {
      const token: string =
        request?.header('Authorization')?.split(' ')[1] || '';

      const parsedTokens = JSON.parse(token);
      const accessToken = parsedTokens.accessToken;
      const payload = await JWT.validate(accessToken);

      validateTokenData(payload);

      request['authId'] = payload.sub;
      request['userId'] = payload.ext.userId;
      request['email'] = payload.ext.email;

      return true;
    } catch (error) {
      logger.error('Authentication failed', error);

      throw new UnauthorizedException('Authentication failed');
    }
  }
}
