import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
    bio: z.string().trim().max(255).nullable().optional(),
    avatar: z.string().url().nullable().optional(),
    cover: z.string().url().nullable().optional(),
    websiteUrl: z.string().url().nullable().optional()
  })
  .strict()
  .refine(
    (data) =>
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.bio !== undefined ||
      data.avatar !== undefined ||
      data.cover !== undefined ||
      data.websiteUrl !== undefined,
    {
      message: 'At least one profile field is required'
    }
  );
