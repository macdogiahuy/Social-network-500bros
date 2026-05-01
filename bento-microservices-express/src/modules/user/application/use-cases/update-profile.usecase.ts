import { IUserRepository } from '../../domain/interfaces/user.interfaces';

export class UpdateProfileUseCase {
  public constructor(private readonly userRepository: IUserRepository) {}

  public async execute(input: {
    userId: string;
    firstName?: string;
    lastName?: string;
    bio?: string | null;
    avatar?: string | null;
    cover?: string | null;
    websiteUrl?: string | null;
  }): Promise<boolean> {
    return this.userRepository.updateProfile(input.userId, {
      firstName: input.firstName?.trim(),
      lastName: input.lastName?.trim(),
      bio: input.bio?.trim() ?? input.bio,
      avatar: input.avatar,
      cover: input.cover,
      websiteUrl: input.websiteUrl?.trim() ?? input.websiteUrl
    });
  }
}
