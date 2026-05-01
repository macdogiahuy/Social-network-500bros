import { IUserRepository, UserProfile } from '../../domain/interfaces/user.interfaces';

export class GetProfileUseCase {
  public constructor(private readonly userRepository: IUserRepository) {}

  public async execute(input: { userId: string }): Promise<UserProfile | null> {
    return this.userRepository.getProfile(input.userId);
  }
}
