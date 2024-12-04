// src/types/express.d.ts
import 'express';

declare module 'express' {
  export interface Request {
    authId: string;
    userId: string;
    email?: string;
  }
}
