import { jwtProvider } from '@shared/components/jwt';
import { IRepository, Requester, TokenPayload, UserRole } from '@shared/interface';
import { Paginated, PagingDTO } from '@shared/model';
import { AppError, ErrNotFound, ErrInvalidToken, ErrInvalidUsernameAndPassword, ErrUserInactivated, ErrUsernameExisted } from '@shared/utils/error';
import bcrypt from 'bcrypt';
import { v7 } from 'uuid';
import { IUserUseCase } from '../interface';
import {
  Status,
  User,
  UserCondDTO,
  userCondDTOSchema,
  UserLoginDTO,
  userLoginDTOSchema,
  UserRegistrationDTO,
  userRegistrationDTOSchema,
  UserUpdateDTO,
  userUpdateDTOSchema,
  userUpdateProfileDTOSchema
} from '../model';


// Define the Business logic of the User 
export class UserUseCase implements IUserUseCase {
  
  // Take the IRepository as the construction injection
  // So any class that inherits the IRepository will be used (Read and Write)
  constructor(private readonly repository: IRepository<User, UserCondDTO, UserUpdateDTO>) {}

  /**
   * Type guard that ensures a user exists and has ACTIVE status.
   * Throws ErrUserInactivated if the user is null or not ACTIVE.
   *
   * Use this method to validate user eligibility before performing sensitive operations
   * like authentication, token verification, or profile updates. The `asserts` keyword
   * tells TypeScript that after this call, the user parameter is guaranteed to be
   * non-null and satisfy the condition.
   *
   * @param user - The user to validate (can be null or undefined)
   * @throws ErrUserInactivated - if user is null or status is not ACTIVE (including DELETED, INACTIVE, BANNED)
   *
   * @example
   * ```
   * const user = await this.repository.findById(userId);
   * this.requireActiveUser(user); // TypeScript now knows user is User, not null
   * // Safe to use user.id, user.email, etc.
   * ```
   */
  private requireActiveUser(user: User | null): asserts user is User {
    if (!user || user.status !== Status.ACTIVE) {
      throw ErrUserInactivated;
    }
  }

  
  /**
   * Get user profile by ID.
   * 
   * @param userId - The ID of the user to fetch
   * @returns User entity
   * @throws ErrNotFound - if user not found
   */
  async profile(userId: string): Promise<User> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw ErrNotFound;
    }

    return user;
  }
  
  /**
   * Verifies a JWT token and returns the payload.
   * Also validates that the user exists and is active.
   * 
   * @param token - JWT token string
   * @returns TokenPayload with user ID (sub) and role
   * @throws ErrInvalidToken - if token is invalid or expired
   * @throws ErrNotFound - if user from token not found
   * @throws ErrUserInactivated - if user status is DELETED/INACTIVE/BANNED
   */
  async verifyToken(token: string): Promise<TokenPayload> {
    const payload = await jwtProvider.verifyToken(token);

    if (!payload) {
      throw ErrInvalidToken;
    }

    const user = await this.repository.findById(payload.sub);
    this.requireActiveUser(user);

    return { sub: user.id, role: user.role };
  }
 
  /**
   * Authenticates a user with username and password.
   * 
   * Flow:
   * 1. Validate input DTO with Zod schema
   * 2. Find user by username - throw if not found
   * 3. Check user status (must be ACTIVE) - throw if deleted/inactive
   * 4. Verify password with bcrypt - throw if invalid
   * 5. Generate JWT token with user id and role
   * 
   * @param data - UserLoginDTO containing username and password
   * @returns JWT token string
   * @throws ErrInvalidUsernameAndPassword - if username not found or password invalid
   * @throws ErrUserInactivated - if user status is DELETED or INACTIVE
   */
  async login(data: UserLoginDTO): Promise<string> {
    // Step 1: Validate input DTO
    const dto = userLoginDTOSchema.parse(data);

    // Step 2: Find user by username
    const user = await this.repository.findByCond({ username: dto.username });
    if (!user) {
      throw AppError.from(ErrInvalidUsernameAndPassword, 400).withLog(
        `Login failed: Username '${dto.username}' not found`
      );
    }

    // Step 3: Check user status (must be active to login)
    this.requireActiveUser(user);

    // Step 4: Verify password
    const isMatch = await this.verifyPassword(dto.password, user.password);
    if (!isMatch) {
      throw AppError.from(ErrInvalidUsernameAndPassword, 400).withLog(
        `Login failed: Invalid password for user '${dto.username}'`
      );
    }

    // Step 5: Generate and return JWT token
    // Token contains user ID (sub) and role for authorization
    const token = jwtProvider.generateToken({
      sub: user.id,
      role: user.role
    });

    return token;
  }

  /**
   * Hashes a plain password and returns the hash and salt.
   * Uses salt rounds: 8 for salt generation, 10 for hashing.
   * 
   * @param password - Plain text password from user input
   * @returns Object containing hashed password and salt
   */
  async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    const salt = await bcrypt.genSalt(8);
    const hash = await bcrypt.hash(password, salt);
    return { hash, salt };
  }

  /**
   * Verifies a plain password against a stored hash.
   * 
   * @param plainPassword - Plain text password from user input
   * @param storedHash - Stored password hash from database
   * @returns True if password matches, false otherwise
   */
  async verifyPassword(plainPassword: string, storedHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, storedHash);
  }


  /**
   * Registers a new user in the system.
   * 
   * Flow:
   * 1. Validate input DTO with Zod schema
   * 2. Check if username already exists - throw if exists
   * 3. Hash the password with bcrypt
   * 4. Create new user object with default values (status: ACTIVE, role: USER)
   * 5. Insert into database
   * 
   * @param data - UserRegistrationDTO containing firstName, lastName, username, password
   * @returns User ID of newly created user
   * @throws ErrUsernameExisted - if username already exists
   */
  async register(data: UserRegistrationDTO): Promise<string> {
    // Step 1: Validate input DTO
    const dto = userRegistrationDTOSchema.parse(data);

    // Step 2: Check if username already exists
    const existedUser = await this.repository.findByCond({ username: dto.username });
    if (existedUser) {
      throw AppError.from(ErrUsernameExisted, 400).withLog(
        `Register failed: Username '${dto.username}' is already registered`
      );
    }

    // Step 3: Hash password
    const { hash, salt } = await this.hashPassword(dto.password);

    // Step 4: Create new user object
    const newId = v7();
    const newUser: User = {
      ...dto,
      password: hash,
      id: newId,
      status: Status.ACTIVE,
      salt: salt,
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Step 5: Insert into database
    await this.repository.insert(newUser);

    return newId;
  }

  async create(data: UserRegistrationDTO): Promise<string> {
    return await this.register(data);
  }

  async getDetail(id: string): Promise<User | null> {
    const data = await this.repository.findById(id);

    if (!data || data.status === Status.DELETED) {
      throw ErrNotFound;
    }

    return data;
  }

  /**
   * Updates the profile of the currently authenticated user.
   * Users can only update their own profile and cannot change role/status.
   * If password is being updated, it will be hashed before storing.
   *
   * @param requester - The authenticated user making the request (from JWT)
   * @param data - UserUpdateProfileDTO containing fields to update
   * @returns true if update successful
   * @throws ErrUserInactivated - if user is not found or is not active
   */
  async updateProfile(requester: Requester, data: UserUpdateDTO): Promise<boolean> {
    // Step 1: Validate input DTO (excludes role and status)
    const dto = userUpdateProfileDTOSchema.parse(data);

    // Step 2: Verify user exists and is eligible for update
    const user = await this.repository.findById(requester.sub);
    this.requireActiveUser(user);

    // Step 3: Hash password if being updated
    if (dto.password) {
      const { hash, salt } = await this.hashPassword(dto.password);
      dto.salt = salt;
      dto.password = hash;
    }

    // Step 4: Update in database
    await this.repository.update(requester.sub, dto);

    return true;
  }

  /**
   * Updates any user by admin.
   * Unlike updateProfile, this allows changing role and status fields.
   * If password is being updated, it will be hashed before storing.
   *
   * @param id - The ID of the user to update
   * @param data - UserUpdateDTO containing fields to update (including role/status)
   * @returns true if update successful
   * @throws ErrUserInactivated - if user is not found or is not active
   */
  async update(id: string, data: UserUpdateDTO): Promise<boolean> {
    // Step 1: Validate input DTO (includes role and status)
    const dto = userUpdateDTOSchema.parse(data);

    // Step 2: Verify user exists and is eligible for update
    const user = await this.repository.findById(id);
    this.requireActiveUser(user);

    // Step 3: Hash password if being updated
    if (dto.password) {
      const { hash, salt } = await this.hashPassword(dto.password);
      dto.salt = salt;
      dto.password = hash;
    }

    // Step 4: Update in database
    await this.repository.update(id, dto);

    return true;
  }

  /**
   * Lists users with filtering and pagination.
   * 
   * @param cond - Filter conditions (username, firstName, lastName, role, status)
   * @param paging - Pagination parameters (page, limit)
   * @returns Paginated list of users
   */
  async list(cond: UserCondDTO, paging: PagingDTO): Promise<Paginated<User>> {
    const parsedCond = userCondDTOSchema.parse(cond);

    return await this.repository.list(parsedCond, paging);
  }

  /**
   * Soft deletes a user by setting status to DELETED.
   * 
   * @param id - The ID of the user to delete
   * @returns true if deletion successful
   * @throws ErrNotFound - if user not found or already deleted
   */
  async delete(id: string): Promise<boolean> {
    const data = await this.repository.findById(id);

    if (!data || data.status === Status.DELETED) {
      throw ErrNotFound;
    }

    await this.repository.delete(id, false);

    return true;
  }

  /**
   * Batch fetches multiple users by their IDs.
   * Strips sensitive data (password, salt) from the response.
   * 
   * @param ids - Array of user IDs to fetch
   * @returns Array of users without sensitive fields
   */
  async listByIds(ids: string[]): Promise<User[]> {
    const users = await this.repository.listByIds(ids);

    return users.map((user) => {
      const { password, salt, ...rest } = user;
      return rest as User;
    });
  }
}
