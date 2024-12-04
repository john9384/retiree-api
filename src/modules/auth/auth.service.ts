import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { UserService } from '../user/user.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { createTokens } from 'library/helpers/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userService: UserService,
  ) {}

  async register(payload: RegisterDto) {
    const existingUser = await this.userService.read({ email: payload.email });

    if (existingUser) {
      throw new BadRequestException('User with email exists');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const auth = await this.authRepository.create({
      email: payload.email,
      password: hashedPassword,
    });

    await this.userService.create({
      authId: auth.id,
      email: payload.email,
      rsaPin: payload.rsaPin,
      surname: payload.surname,
    });
    return this.authRepository.serialize(auth);
  }

  async login({ email, password }: LoginDto) {
    const auth = await this.authRepository.findOne({ email });

    if (!auth) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordIsValid = await bcrypt.compare(password, auth.password);

    if (!passwordIsValid) {
      await this.authRepository.update(
        { id: auth.id },
        {
          loginAttempts: auth.loginAttempts + 1,
        },
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const publicKey = crypto.randomBytes(64).toString('hex');
    const privateKey = crypto.randomBytes(64).toString('hex');

    await this.authRepository.update(
      { id: auth.id },
      {
        publicKey,
        privateKey,
        loginAttempts: 0,
      },
    );

    const user = await this.userService.read({ authId: auth.id });

    const tokens = await createTokens(String(auth.id), publicKey, privateKey, {
      userId: user.id,
      email: auth.email,
    });

    return { token: tokens, userData: user };
  }

  public async currentUser(authId: string) {
    return await this.userService.read({ authId });
  }

  public async logout(authId: string) {
    await this.authRepository.update(
      { id: authId },
      {
        publicKey: null,
        privateKey: null,
        loginAttempts: 0,
      },
    );

    return { authId, loggedOut: true };
  }
}
