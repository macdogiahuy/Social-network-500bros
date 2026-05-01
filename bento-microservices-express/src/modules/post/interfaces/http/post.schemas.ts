import { z } from 'zod';

export const createPostSchema = z
  .object({
    authorId: z.string().uuid().optional(),
    topicId: z.string().uuid(),
    content: z.string().trim().min(1).max(2000),
    imageUrl: z.string().url().nullable().optional()
  })
  .strict();

export const updatePostSchema = z
  .object({
    content: z.string().trim().min(1).max(2000).optional(),
    imageUrl: z.string().url().nullable().optional()
  })
  .strict()
  .refine((data) => data.content !== undefined || data.imageUrl !== undefined, {
    message: 'At least one field to update is required'
  });
