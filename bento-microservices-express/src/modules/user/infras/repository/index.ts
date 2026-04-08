/**
 * Command Query Responsibility Segregation
 * to seperates the write actions (Commands) from the read actions (queries)
 */

import { IUserCommandRepository, UserCounterFields } from "@modules/user/interface";
import { Status, User, UserCondDTO, UserUpdateDTO } from "@modules/user/model";
import prisma from "@shared/components/prisma";
import { ICommandRepository, IQueryRepository, IRepository, UserRole } from "@shared/interface";
import { Paginated, PagingDTO } from "@shared/model";
import { Prisma } from "@prisma/client";
import { AppError } from "@shared/utils/error";
/**
 * Unified User Repository (CQRS Facade).
 * Implements the IRepository interface but delegates actual DB operations to injected 
 * Query (Read) and Command (Write) repositories to adhere strictly to CQRS and Dependency Inversion.
 */
export class PrismaUserRepository implements IRepository<User, UserCondDTO, UserUpdateDTO> {
  constructor(
    private readonly queryRepository: IQueryRepository<User, UserCondDTO>,
    private readonly commandRepository: ICommandRepository<User, UserUpdateDTO>
  ) {}

  async findById(id: string): Promise<User | null> {
    return await this.queryRepository.findById(id);
  }

  async findByCond(condition: UserCondDTO): Promise<User | null> {
    return await this.queryRepository.findByCond(condition);
  }

  async list(cond: UserCondDTO, paging: PagingDTO): Promise<Paginated<User>> {
    return await this.queryRepository.list(cond, paging);
  }

  async listByIds(ids: string[]): Promise<User[]> {
    return await this.queryRepository.listByIds(ids);
  }

  async insert(data: User): Promise<boolean> {
    return await this.commandRepository.insert(data);
  }

  async update(id: string, data: UserUpdateDTO): Promise<boolean> {
    return await this.commandRepository.update(id, data);
  }

  async delete(id: string, isHard: boolean): Promise<boolean> {
    return await this.commandRepository.delete(id, isHard);
  }  
}

/**
 * Prisma User Command Repository.
 * Handles exclusively write-heavy operations (Mutations) directly against the Prisma ORM.
 * Implements hard vs soft deletion routing.
 */
export class PrismaUserCommandRepository implements IUserCommandRepository {

  async incrementCount(id: string, field: UserCounterFields, step: number): Promise<boolean> {
    try {
      await prisma.users.update({ where: { id }, data: { [field]: { increment: step } } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw AppError.from(new Error('User not found.'), 404);
      throw error;
    }
  }

  async decrementCount(id: string, field: UserCounterFields, step: number): Promise<boolean> {
    try {
      await prisma.users.update({ where: { id }, data: { [field]: { decrement: step } } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw AppError.from(new Error('User not found.'), 404);
      throw error;
    }
  }

  async insert(data: User): Promise<boolean> {
    try {
      await prisma.users.create({ data });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw AppError.from(new Error('User data already exists (Unique constraint violation).'), 409);
      }
      throw error;
    }
  }

  async update(id: string, data: UserUpdateDTO): Promise<boolean> {
    try {
      await prisma.users.update({ where: { id }, data });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw AppError.from(new Error('User data already exists (Unique constraint violation).'), 409);
        if (error.code === 'P2025') throw AppError.from(new Error('User not found.'), 404);
      }
      throw error;
    }
  }

  async delete(id: string, isHard?: boolean): Promise<boolean> {
    try {
      isHard ? 
        await prisma.users.delete({ where: { id } }) 
        : await prisma.users.update({ where: { id }, data: { status: 'deleted' } });
  
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw AppError.from(new Error('User not found.'), 404);
      throw error;
    }
  }

  async deleteByCond(cond: UserCondDTO, isHard?: boolean): Promise<boolean> {
    try {
      if (isHard) {
        await prisma.users.deleteMany({ where: cond });
      } else {
        await prisma.users.updateMany({ where: cond, data: { status: 'deleted' } });
      }
  
      return true;
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Prisma User Query Repository.
 * Implements the IQueryRepository and is strictly responsible for fetching, filtering, 
 * and paginating data securely from Prisma without causing side effects.
 */
export class PrismaUserQueryRepository implements IQueryRepository<User, UserCondDTO> {
  async findById(id: string): Promise<User | null> {
    const data = await prisma.users.findUnique({ where: { id } });
    if (!data) return null;

    return { ...data, role: data.role as UserRole } as User;
  }
  
  async findByCond(condition: UserCondDTO): Promise<User | null> {
    const data = await prisma.users.findFirst({ where: condition });
    if (!data) return null;

    return { ...data, role: data.role as UserRole } as User;
  }
  
  async list(cond: UserCondDTO, paging: PagingDTO): Promise<Paginated<User>> {
    const condition = { ...cond, NOT: { status: Status.DELETED } };
    const skip = (paging.page - 1) * paging.limit;
  
    // Use prisma.$transaction to fire these queries concurrently 
    const countPromise = prisma.users.count({ where: condition }); 
    const itemsPromise = prisma.users.findMany({
      where: condition,
      take: paging.limit,
      skip,
      orderBy: { createdAt: 'desc' }
    });
  
    const [total, items] = await prisma.$transaction([
      countPromise, 
      itemsPromise
    ]);

    return {
      data: items.map(item => ({ ...item, role: item.role as UserRole }) as User),
      paging,
      total
    }
  }

  async listByIds(ids: string[]): Promise<User[]> {
    const data = await prisma.users.findMany({ where: { id: { in: ids } } });
    return data.map(item => ({ ...item, role: item.role as UserRole }) as User);
  }
}
