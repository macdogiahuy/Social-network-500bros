import { z } from 'zod';

export const resetTokenSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  token: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
  isUsed: z.boolean().default(false)
});

export type ResetToken = z.infer<typeof resetTokenSchema>;

export const createResetTokenDTOSchema = resetTokenSchema.pick({
  userId: true,
  token: true,
  expiresAt: true
});

export type CreateResetTokenDTO = z.infer<typeof createResetTokenDTOSchema>;

export const resetPasswordDTOSchema = z
  .object({
    token: z.string(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

export type ResetPasswordDTO = z.infer<typeof resetPasswordDTOSchema>;

export const requestResetDTOSchema = z.object({
  email: z.string().email('Invalid email format')
});

export type RequestResetDTO = z.infer<typeof requestResetDTOSchema>;
