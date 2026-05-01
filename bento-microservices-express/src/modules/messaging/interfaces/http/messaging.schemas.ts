import { z } from 'zod';

export const sendMessageSchema = z
  .object({
    roomId: z.string().uuid(),
    content: z.string().trim().min(1).max(5000).optional(),
    fileUrl: z.string().url().optional()
  })
  .strict()
  .refine((data) => data.content !== undefined || data.fileUrl !== undefined, {
    message: 'content or fileUrl is required'
  });

export const reactMessageSchema = z
  .object({
    messageId: z.string().uuid(),
    emoji: z.string().trim().min(1).max(32)
  })
  .strict();
