import { z } from 'zod';

export const savePostSchema = z
  .object({
    postId: z.string().uuid()
  })
  .strict();
