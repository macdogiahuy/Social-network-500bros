import bcrypt from 'bcrypt';
import { IAuthUserRepository } from '../../domain/interfaces/auth-user-repository.interface';
import { ITokenService } from '../../domain/interfaces/token-service.interface';

export class LoginUseCase {
  public constructor(
    private readonly authUserRepository: IAuthUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  public async execute(input: { username: string; password: string }): Promise<{
    token: string;
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      role: 'user' | 'admin';
    };
  }> {
    const user = await this.authUserRepository.findByUsername(input.username.trim());
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const matched = await bcrypt.compare(input.password, user.passwordHash);
    if (!matched) {
      throw new Error('Invalid credentials');
    }

    const token = await this.tokenService.generate({
      sub: user.id,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
  }
}
