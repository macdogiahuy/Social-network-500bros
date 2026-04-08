import { ICommandRepository, IRepository, IUseCase, Requester, TokenPayload } from "@shared/interface";
import { User, UserCondDTO, UserLoginDTO, UserRegistrationDTO, UserUpdateDTO } from "../model";

/**
 * User Use Case Interface.
 * Defines the core business logic boundary for the User module.
 * Inherits standard CRUD operations from `IUseCase` and adds domain-specific User procedures.
 */
export interface IUserUseCase extends IUseCase<UserRegistrationDTO, UserUpdateDTO, User, UserCondDTO> {
  /**
   * Authenticates a user and returns a JWT access token.
   * @param data User login credentials (email and password)
   * @returns JWT access token string
   */
  login(data: UserLoginDTO): Promise<string>;

  /**
   * Registers a new user account into the system and returns a JWT access token.
   * @param data User registration details
   * @returns JWT access token string
   */
  register(data: UserRegistrationDTO): Promise<string>;

  /**
   * Fetches a user's detailed profile securely by their unique ID.
   * @param userId The ID of the user to fetch
   * @returns Resolves to User entity
   */
  profile(userId: string): Promise<User>;

  /**
   * Updates a user's profile securely, verifying requester permissions.
   * @param requester The currently authenticated user performing the action
   * @param data The profile data to update
   * @returns True if the update was successful
   */
  updateProfile(requester: Requester, data: UserUpdateDTO): Promise<boolean>;

  /**
   * Validates a JWT token and extracts the payload.
   * Used primarily for authentication middleware and security boundaries.
   * @param token JWT string to verify
   * @returns Decoded Token Payload
   */
  verifyToken(token: string): Promise<TokenPayload>;

  /**
   * Batch fetches multiple users by an array of IDs.
   * Essential for resolving dependencies (e.g., getting authors of posts).
   * @param ids Array of User UUIDs
   * @returns Array of User entities
   */
  listByIds(ids: string[]): Promise<User[]>;
}


/**
 * Strict union type mapped exactly to Prisma's 'Users' model schema.
 * Locks down counter mutations to only valid database columns, preventing TypeScript runtime crashes.
 */
export type UserCounterFields = 'followerCount' | 'postCount';

/**
 * User Command Repository Interface.
 * Handles write-heavy database operations (CQRS Command layer) specifically for Users.
 * Extends the standard ICommandRepository with strict typing logic.
 */
export interface IUserCommandRepository extends ICommandRepository<User, UserUpdateDTO, UserCondDTO> {
  /**
   * Atomically increments a protected counter field on the User model.
   * Leverages explicit UserCounterFields typing to guarantee safety.
   * @param id Target User ID
   * @param field The strict database field to increment (followerCount | postCount)
   * @param step The amount to add (usually 1)
   * @returns True if successful
   */
  incrementCount(id: string, field: UserCounterFields, step: number): Promise<boolean>;

  /**
   * Atomically decrements a protected counter field on the User model.
   * @param id Target User ID
   * @param field The strict database field to decrement (followerCount | postCount)
   * @param step The amount to subtract (usually 1)
   * @returns True if successful
   */
  decrementCount(id: string, field: UserCounterFields, step: number): Promise<boolean>;
}
