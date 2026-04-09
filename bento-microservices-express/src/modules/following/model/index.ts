import { publicUserSchema } from '@shared/model';
import z from 'zod';

const baseFollowSchema = z.object({
  followerId: z.string().uuid(),
  followingId: z.string().uuid()
});

// This is for doing something (like clicking "Follow" or "Unfollow").
// You absolutely must have both UUIDs for that action to make sense.
export const followDTOSchema = baseFollowSchema.refine(data => data.followerId != data.followingId, {
  message: "You cannot follow yourself",
  path: ["followingId"]
});
export type FollowDTO = z.infer<typeof followDTOSchema>;

// This is for querying the database (automatically making both fields optional)
export const followCondDTOSchema = baseFollowSchema
  .partial()
  .extend({
    followerId: z.string().uuid().optional(),
    followingId: z.string().uuid().optional()
  })
  .strict();
export type FollowCondDTO = z.infer<typeof followCondDTOSchema>;


export const followSchema = z.object({
  followerId: z.string().uuid(),
  followingId: z.string().uuid(),
  createdAt: z.date().default(new Date())
});
export type Follow = z.infer<typeof followSchema>;


export const followResponseSchema = publicUserSchema.extend({
  hasFollowedBack: z.boolean(),
  followedAt: z.date()
})
export type Follower = z.infer<typeof followResponseSchema>

// export type Follower = PublicUser & {
//   hasFollowedBack: boolean;
//   followedAt: Date;
// };
