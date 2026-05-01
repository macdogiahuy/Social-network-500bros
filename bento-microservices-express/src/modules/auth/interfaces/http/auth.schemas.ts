import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z.string().trim().min(3).max(100),
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    password: z.string().min(8).max(100)
  })
  .strict();

export const loginSchema = z
  .object({
    username: z.string().trim().min(1).max(100),
    password: z.string().min(1).max(100)
  })
  .strict();

export const oauthLoginSchema = z
  .object({
    provider: z.enum(['google', 'github']),
    accessToken: z.string().min(1).max(4096)
  })
  .strict();
