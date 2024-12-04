/* eslint-disable @typescript-eslint/ban-ts-comment */
import { config } from 'config';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';
import { AuthFailureError, BadTokenError, InternalError } from './errors';
import logger from './logger';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export default class JWT {
  private static readPublicKey(): string {
    return fs.readFileSync(
      path.join(__dirname, '../../../keys/public.pem'),
      'utf8',
    );
  }

  private static readPrivateKey(): string {
    return fs.readFileSync(
      path.join(__dirname, '../../../keys/private.pem'),
      'utf8',
    );
  }

  public static async encode(payload: JwtPayload): Promise<string> {
    try {
      const cert = this.readPrivateKey();
      if (!cert) throw new InternalError('Token generation failure');

      return jwt.sign({ ...payload }, cert, { algorithm: 'RS256' });
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * This method checks the token and returns the decoded data when token is valid in all respect
   */
  public static async validate(token: string): Promise<JwtPayload> {
    const cert = await this.readPublicKey();
    try {
      return jwt.verify(token, cert, {
        algorithms: ['RS256'],
      }) as JwtPayload;
    } catch (e: unknown) {
      if (e instanceof Error) {
        logger.error(e.message);
        if (e && e.name === 'TokenExpiredError')
          throw new jwt.TokenExpiredError('Token is expired', new Date());
      }
      throw new BadTokenError();
    }
  }

  /**
   * Returns the decoded payload if the signature is valid even if it is expired
   */
  public static async decode(token: string): Promise<JwtPayload> {
    const cert = this.readPublicKey();
    try {
      return jwt.verify(token, cert, {
        ignoreExpiration: true,
      }) as JwtPayload;
    } catch (e) {
      if (e instanceof Error) {
        logger.error(e.message);
      }
      throw new BadTokenError();
    }
  }
}

export class JwtPayload {
  aud: string;
  sub: string;
  iss: string;
  iat: number;
  exp: number;
  prm: string;
  ext: Record<string, any>;

  constructor(
    issuer: string,
    audience: string,
    subject: string,
    param: string,
    validity: number,
    ext?: Record<string, any>,
  ) {
    this.iss = issuer;
    this.aud = audience;
    this.sub = subject;
    this.iat = Math.floor(Date.now() / 1000);
    this.exp = this.iat + validity * 24 * 60 * 60;
    this.prm = param;
    this.ext = ext;
  }
}

export const createTokens = async (
  id: string,
  accessTokenKey: string,
  refreshTokenKey: string,
  ext: Record<string, any>,
): Promise<ITokens> => {
  try {
    const accessToken = await JWT.encode(
      new JwtPayload(
        config.tokenInfo.issuer,
        config.tokenInfo.audience,
        id,
        accessTokenKey,
        config.tokenInfo.accessTokenValidityDays,
        ext,
      ),
    );

    if (!accessToken) throw new InternalError();

    const refreshToken = await JWT.encode(
      new JwtPayload(
        config.tokenInfo.issuer,
        config.tokenInfo.audience,
        id.toString(),
        refreshTokenKey,
        config.tokenInfo.refreshTokenValidityDays,
        ext,
      ),
    );

    if (!refreshToken) throw new InternalError();

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    } as ITokens;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    throw error;
  }
};

export const generateRandomPassword = (): string => {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyz';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

export const validateTokenData = (payload: JwtPayload): boolean => {
  try {
    if (
      !payload ||
      !payload.iss ||
      !payload.sub ||
      !payload.aud ||
      !payload.prm ||
      !payload.ext ||
      payload.iss !== config.tokenInfo.issuer ||
      payload.aud !== config.tokenInfo.audience
    )
      throw new AuthFailureError('Invalid Token');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    throw error;
  }
};
