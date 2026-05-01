export type UserProfile = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  avatar: string | null;
  cover: string | null;
  websiteUrl: string | null;
  followerCount: number;
  postCount: number;
};

export interface IUserRepository {
  exists(userId: string): Promise<boolean>;
  getProfile(userId: string): Promise<UserProfile | null>;
  updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      bio?: string | null;
      avatar?: string | null;
      cover?: string | null;
      websiteUrl?: string | null;
    }
  ): Promise<boolean>;
}
