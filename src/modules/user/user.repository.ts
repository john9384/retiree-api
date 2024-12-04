import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from './user.model';
import { BaseRepository } from 'database/BaseRepository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {
    super(userModel);
  }

  serialize(user: User): Partial<User> {
    return {
      email: user.email,
      surname: user.surname,
    };
  }
}
