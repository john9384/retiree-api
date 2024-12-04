import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  appName: process.env.APP_NAME,
  port: process.env.PORT,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,

  logs: {
    level: process.env.LOG_LEVEL || 'silly',
    directory: process.env.LOG_DIRECTORY,
  },
  tokenInfo: {
    accessTokenValidityDays: Number(process.env.ACCESS_TOKEN_VALIDITY_DAYS),
    refreshTokenValidityDays: Number(process.env.REFRESH_TOKEN_VALIDITY_DAYS),
    issuer: process.env.TOKEN_ISSUER || '',
    audience: process.env.TOKEN_AUDIENCE || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_MIN,
  },
  db: { mongoURl: process.env.MONGO_URL },
};
