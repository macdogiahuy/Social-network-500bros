import { ICommandRepository, IRepository, IUseCase, Requester, TokenPayload } from "@shared/interface";
import { User, UserCondDTO, UserLoginDTO, UserRegistrationDTO, UserUpdateDTO } from "../model";
import { RequestResetDTO, ResetPasswordDTO } from "../model/reset-password";

/**
 * User Use Case Interface.
 * Defines the core business logic boundary for the User module.
 * Inherits standard CRUD operations from `IUseCase` and adds domain-specific User procedures.
 * 
 * This interface follows the Use Case pattern (Application Layer in Clean Architecture).
 * It encapsulates all business rules related to User entity.
 * 
 * @extends IUseCase<UserRegistrationDTO, UserUpdateDTO, User, UserCondDTO>
 */
export interface IUserUseCase extends IUseCase<UserRegistrationDTO, UserUpdateDTO, User, UserCondDTO> {
  /**
   * Authenticates a user and returns a JWT access token.
   * Flow: validate input → find user → check status → verify password → generate JWT
   * @param data User login credentials (email and password)
   * @returns JWT access token string
   * @throws ErrInvalidUsernameAndPassword if credentials are invalid
   * @throws ErrUserInactivated if user is not active
   */
  login(data: UserLoginDTO): Promise<string>;

  /**
   * Registers a new user account into the system and returns a JWT access token.
   * Flow: validate input → check username uniqueness → hash password → create user → generate JWT
   * @param data User registration details
   * @returns JWT access token string
   * @throws ErrUsernameExisted if username already exists
   */
  register(data: UserRegistrationDTO): Promise<string>;

  /**
   * Fetches a user's detailed profile securely by their unique ID.
   * @param userId The ID of the user to fetch
   * @returns Resolves to User entity
   * @throws ErrNotFound if user not found or deleted
   */
  profile(userId: string): Promise<User>;

  /**
   * Updates a user's profile securely, verifying requester permissions.
   * Only the user themselves or an admin can update the profile.
   * @param requester The currently authenticated user performing the action
   * @param data The profile data to update
   * @returns True if the update was successful
   * @throws ErrNotFound if user not found
   * @throws ErrForbidden if requester doesn't have permission
   */
  updateProfile(requester: Requester, data: UserUpdateDTO): Promise<boolean>;

  /**
   * Validates a JWT token and extracts the payload.
   * Used primarily for authentication middleware and security boundaries.
   * @param token JWT string to verify
   * @returns Decoded Token Payload
   * @throws ErrTokenInvalid if token is invalid or expired
   */
  verifyToken(token: string): Promise<TokenPayload>;

  /**
   * Batch fetches multiple users by an array of IDs.
   * Essential for resolving dependencies (e.g., getting authors of posts).
   * @param ids Array of User UUIDs
   * @returns Array of User entities
   */
  listByIds(ids: string[]): Promise<User[]>;

  /**
   * Verifies a plain password against a stored hash.
   * Used by login and password reset flows to validate credentials.
   * @param plainPassword Plain text password from user input
   * @param storedHash Stored password hash from database
   * @returns True if password matches, false otherwise
   */
  verifyPassword(plainPassword: string, storedHash: string): Promise<boolean>;

  /**
   * Hashes a plain password and returns the hash and salt.
   * Uses bcrypt with 8 salt rounds internally.
   * Central method for password hashing - used by register, password reset, and password change flows.
   * @param password Plain text password from user input
   * @returns Object containing hashed password and salt
   */
  hashPassword(password: string): Promise<{ hash: string; salt: string }>;
}

/**
 * Password Reset Use Case Interface.
 * Defines the contract for password reset operations.
 * 
 * Flow:
 * 1. requestReset: User provides email → system generates reset token → sends email
 * 2. resetPassword: User provides token + new password → system validates token → updates password
 */
export interface IPasswordResetUsecase {
  /**
   * Initiates password reset flow.
   * Finds user by email, generates reset token, sends email with reset link.
   * @param data Contains email address
   * @returns True if email was sent successfully
   * @throws ErrUserNotFound if email not found
   * @throws ErrEmailNotSent if email service fails
   */
  requestReset(data: RequestResetDTO): Promise<boolean>;

  /**
   * Completes password reset flow.
   * Validates token, updates user password, invalidates all existing tokens.
   * @param data Contains reset token and new password
   * @returns True if password was updated successfully
   * @throws ErrInvalidToken if token is invalid, expired, or already used
   */
  resetPassword(data: ResetPasswordDTO): Promise<boolean>;
}

/**
 * User Statistics Data Transfer Object.
 * Contains aggregated stats for a user's profile.
 */
export interface UserStats {
  id: string;
  username: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  totalLikes: number;
}

/**
 * User Stats Use Case Interface.
 * Defines the contract for retrieving user statistics.
 */
export interface IUserStatsUsecase {
  /**
   * Retrieves aggregated statistics for a user.
   * Queries follower count, following count, post count, and total likes received.
   * @param userId The ID of the user
   * @returns UserStats object with aggregated data
   * @throws ErrUserNotFound if user not found
   */
  getUserStats(userId: string): Promise<UserStats>;
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
