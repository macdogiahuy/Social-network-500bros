import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import {
  AuthUser,
  IAuthUserRepository
} from '../../domain/interfaces/auth-user-repository.interface';

export class PrismaAuthUserRepository implements IAuthUserRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async create(input: {
    username: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    salt: string;
  }): Promise<AuthUser> {
    const created = await this.prisma.users.create({
      data: {
        id: randomUUID(),
        username: input.username,
        firstName: input.firstName,
        lastName: input.lastName,
        password: input.passwordHash,
        salt: input.salt
      }
    });

    return {
      id: created.id,
      username: created.username,
      firstName: created.firstName ?? '',
      lastName: created.lastName ?? '',
      role: created.role === 'admin' ? 'admin' : 'user',
      passwordHash: created.password,
      salt: created.salt
    };
  }

  public async findByUsername(username: string): Promise<AuthUser | null> {
    const found = await this.prisma.users.findUnique({
      where: { username }
    });
    if (!found) {
      return null;
    }

    return {
      id: found.id,
      username: found.username,
      firstName: found.firstName ?? '',
      lastName: found.lastName ?? '',
      role: found.role === 'admin' ? 'admin' : 'user',
      passwordHash: found.password,
      salt: found.salt
    };
  }
}
