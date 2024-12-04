import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  InternalError,
  AuthFailureError,
  BadRequestError,
  ForbiddenError,
} from 'library/helpers/errors';
import logger from 'library/helpers/logger';
import {
  InternalErrorResponse,
  AuthFailureResponse,
  BadRequestResponse,
  ForbiddenResponse,
  NotFoundResponse,
  InvalidInputResponse,
} from 'library/helpers/response';
import { NotFoundError } from 'rxjs';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Log the error
    logger.error(
      exception instanceof Error
        ? exception.message
        : JSON.stringify(exception),
    );

    let responseBody;
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    // Handle custom error classes
    if (exception instanceof InternalError) {
      responseBody = new InternalErrorResponse(exception.message);
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    } else if (exception instanceof AuthFailureError) {
      responseBody = new AuthFailureResponse(exception.message);
      status = HttpStatus.UNAUTHORIZED;
    } else if (exception instanceof BadRequestError) {
      responseBody = new BadRequestResponse(exception.message);
      status = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof ForbiddenError) {
      responseBody = new ForbiddenResponse(exception.message);
      status = HttpStatus.FORBIDDEN;
    } else if (exception instanceof NotFoundError) {
      responseBody = new NotFoundResponse(exception.message);
      status = HttpStatus.NOT_FOUND;
    }
    // Handle NestJS HTTP Exceptions
    else if (exception instanceof HttpException) {
      switch (true) {
        case exception instanceof UnauthorizedException:
          responseBody = new AuthFailureResponse(exception.message);
          status = HttpStatus.UNAUTHORIZED;
          break;
        case exception instanceof ForbiddenException:
          responseBody = new ForbiddenResponse(exception.message);
          status = HttpStatus.FORBIDDEN;
          break;
        case exception instanceof NotFoundException:
          responseBody = new NotFoundResponse(exception.message);
          status = HttpStatus.NOT_FOUND;
          break;
        case exception instanceof BadRequestException:
          responseBody = new BadRequestResponse(exception.message);
          status = HttpStatus.BAD_REQUEST;
          break;
        case exception instanceof UnprocessableEntityException:
          responseBody = new InvalidInputResponse(
            exception.message,
            exception.getResponse(),
          );
          status = HttpStatus.UNPROCESSABLE_ENTITY;
          break;
        default:
          responseBody = new InternalErrorResponse(exception.message);
      }
    } else if (exception instanceof Error) {
      responseBody = new InternalErrorResponse(exception.message);
    } else {
      responseBody = new InternalErrorResponse('Unknown error occurred');
    }
    logger.warn(status);
    responseBody.send(response);
  }
}
