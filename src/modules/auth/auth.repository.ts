import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Auth } from './auth.model';
import { BaseRepository } from 'database/BaseRepository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthRepository extends BaseRepository<Auth> {
  constructor(@InjectModel('Auth') private readonly authModel: Model<Auth>) {
    super(authModel);
  }

  serialize(auth: Auth): Partial<Auth> {
    return {
      id: auth.id,
      email: auth.email,
    };
  }
}
