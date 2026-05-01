import { z } from 'zod';

export const createCommentSchema = z
  .object({
    content: z.string().trim().min(1).max(2000),
    parentId: z.string().uuid().nullable().optional()
  })
  .strict();

export const updateCommentSchema = z
  .object({
    content: z.string().trim().min(1).max(2000)
  })
  .strict();
