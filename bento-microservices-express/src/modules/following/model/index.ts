import { publicUserSchema } from '@shared/model';
import z from 'zod';

// This is for doing something (like clicking "Follow" or "Unfollow"). 
// You absolutely must have both UUIDs for that action to make sense.
export const followDTOSchema = z.object({
  followerId: z.string().uuid(),
  followingId: z.string().uuid()
}).refine(data => data.followerId != data.followingId, {
  message: "You cannot follow yourself", 
  path: ["followingId"]
});
export type FollowDTO = z.infer<typeof followDTOSchema>;

// This is for querying the database (automatically making both fields optional)
// Note: .partial() automatically strips away the .refine() rule from above!
export const followCondDTOSchema = followDTOSchema.partial().strict()
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
