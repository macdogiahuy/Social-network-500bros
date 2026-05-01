import bcrypt from 'bcrypt';
import { IAuthUserRepository } from '../../domain/interfaces/auth-user-repository.interface';
import { ITokenService } from '../../domain/interfaces/token-service.interface';

export class RegisterUseCase {
  public constructor(
    private readonly authUserRepository: IAuthUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  public async execute(input: {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<{
    token: string;
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      role: 'user' | 'admin';
    };
  }> {
    const existing = await this.authUserRepository.findByUsername(input.username.trim());
    if (existing) {
      throw new Error('Username already exists');
    }

    if (input.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await this.authUserRepository.create({
      username: input.username.trim(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      passwordHash,
      salt
    });

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
