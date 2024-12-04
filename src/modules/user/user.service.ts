import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async create(data: Partial<User>) {
    const user = await this.userRepository.create(data);
    return this.userRepository.serialize(user);
  }

  async read(query: Partial<User>) {
    const user = await this.userRepository.findOne(query);
    return user ? this.userRepository.serialize(user) : null;
  }

  async readMany(query?: Partial<User>) {
    const users = await this.userRepository.find(query);
    return users.map((user) => this.userRepository.serialize(user));
  }

  async update(query: Partial<User>, data: Partial<User>) {
    const user = await this.userRepository.update(query, data);
    return this.userRepository.serialize(user);
  }

  async delete(query: Partial<User>) {
    return this.userRepository.delete(query);
  }
}
