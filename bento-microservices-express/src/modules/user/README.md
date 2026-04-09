# User Module — Complete Architecture Reference

This document provides a deep-dive into the User module, a **Clean Architecture** implementation handling authentication, user management, password reset, and user statistics in the Social Network monolith.

---

## Table of Contents

1. [Directory Structure](#directory-structure)
2. [Architecture Overview](#architecture-overview)
3. [Model Layer](#model-layer)
4. [Interface Layer](#interface-layer)
5. [UseCase Layer](#usecase-layer)
6. [Infrastructure Layer](#infrastructure-layer)
7. [Data Flow Workflows](#data-flow-workflows)
8. [API Endpoints](#api-endpoints)
9. [Dependency Injection](#dependency-injection)
10. [Known Issues & TODOs](#known-issues--todos)

---

## Directory Structure

```
src/modules/user/
├── model/
│   ├── index.ts                      # User entity, enums, Zod validation schemas
│   ├── error.ts                      # Domain-specific error constants
│   └── reset-password.ts             # Password reset DTOs and schemas
├── interface/
│   └── index.ts                      # IUserUseCase, IPasswordResetUsecase, IUserStatsUsecase, IUserCommandRepository
├── usecase/
│   ├── index.ts                      # UserUseCase — core business logic
│   ├── password-reset.usecase.ts    # PasswordResetUsecase — password reset workflow
│   └── user-stats.usecase.ts        # UserStatsUsecase — user aggregation stats
├── infras/
│   ├── repository/
│   │   ├── index.ts                  # CQRS: PrismaUserQueryRepository, PrismaUserCommandRepository, PrismaUserRepository
│   │   ├── reset-token.repository.ts # PrismaResetTokenRepository — in-memory mock
│   │   └── TODOLIST.md               # Known architectural improvements
│   ├── services/
│   │   └── email.service.ts          # EmailService — password reset email (mock)
│   └── transport/
│       ├── index.ts                  # UserHTTPService — HTTP handlers (extend BaseHttpService)
│       ├── redis-consumer.ts         # RedisUserConsumer — listens for Follow/Post events
│       ├── password-reset-http.service.ts  # PasswordResetHttpService — password reset endpoints
│       └── user-stats-http.service.ts      # UserStatsHttpService — stats endpoint
├── module.ts                         # Express router setup & DI wiring (entry point)
└── README.md                         # This file
```

---

## Architecture Overview

The User module follows **Clean Architecture** with strict layering:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           USER MODULE LAYERS                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                      TRANSPORT LAYER                               │ │
│  │  (HTTP Handlers / Redis Events / Express Routes)                   │ │
│  │  ┌──────────────────┬──────────────────┬─────────────────────┐    │ │
│  │  │ UserHTTPService  │ PasswordReset    │ UserStatsHttp       │    │ │
│  │  │                  │ HttpService      │ Service             │    │ │
│  │  └────────┬─────────┴────────┬─────────┴────────┬────────────┘    │ │
│  └───────────┼──────────────────┼─────────────────┼─────────────────┘ │
│              │                  │                 │                    │
│  ┌───────────▼──────────────────▼─────────────────▼──────────────────┐ │
│  │                      USECASE LAYER                               │ │
│  │  (Business Logic & Workflow Orchestration)                       │ │
│  │  ┌───────────────┬────────────────────┬──────────────────────┐   │ │
│  │  │ UserUseCase   │ PasswordReset      │ UserStatsUsecase    │   │ │
│  │  │               │ Usecase            │                      │   │ │
│  │  └───────┬───────┴────────┬───────────┴──────────┬───────────┘   │ │
│  └──────────┼────────────────┼─────────────────────┼───────────────┘ │
│             │                │                     │                  │
│  ┌──────────▼────────────────▼─────────────────────▼───────────────┐ │
│  │                   INTERFACE LAYER                              │ │
│  │  (Port Contracts - IUserUseCase, IUserCommandRepository, ...)  │ │
│  └──────────┬──────────────────────────────────────────────────────┘ │
│             │                                                         │
│  ┌──────────▼──────────────────────────────────────────────────────┐ │
│  │              INFRASTRUCTURE LAYER                              │ │
│  │  (CQRS Repository Pattern / Prisma ORM / Email / Redis Events) │ │
│  │  ┌─────────────────┬──────────────────┬─────────────────────┐  │ │
│  │  │ Query Repo      │ Command Repo     │ ResetTokenRepo      │  │ │
│  │  │ EmailService    │ RedisConsumer    │                     │  │ │
│  │  └────────┬────────┴────────┬─────────┴────────┬────────────┘  │ │
│  └──────────┼─────────────────┼──────────────────┼──────────────┘ │
│             │                 │                  │                  │
│  ┌──────────▼─────────────────▼──────────────────▼──────────────┐ │
│  │                  PERSISTENCE LAYER                          │ │
│  │         (Prisma ORM → MySQL Database / Redis)               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Data Flow:** `HTTP/Redis` → `Transport` → `UseCase` → `Interface` → `Repository` → `Prisma` → `MySQL/Redis`

---

## Model Layer

### Enums

**Status** — User account lifecycle state (maps to Prisma `users_status` enum):
```typescript
enum Status {
  ACTIVE = 'active',        // User can login and perform actions
  PENDING = 'pending',      // Waiting for email verification or approval
  INACTIVE = 'inactive',    // User requested deactivation
  BANNED = 'banned',        // Admin action — user blocked
  DELETED = 'deleted'       // Soft-deleted; hidden from queries
}
```

**Gender** — User demographic (not yet in Prisma schema):
```typescript
enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  UNKNOWN = 'unknown'
}
```

### User Entity

The `User` type is derived from `userSchema` (Zod validation):

| Field | Type | Nullable | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `id` | string (UUID v7) | ❌ | Primary key | Generated on registration |
| `username` | string | ❌ | Unique, 3–25 chars, `/^[a-zA-Z0-9_]+$/` | Lower-cased username for login |
| `email` | string | ✅ | Unique | Optional; used for password reset |
| `firstName` | string | ❌ | Min 2 chars | User's first name |
| `lastName` | string | ❌ | Min 2 chars | User's last name |
| `password` | string | ❌ | Min 6 chars (plaintext) → bcrypt hash | bcrypt hashed password |
| `salt` | string | ❌ | Min 8 chars | bcrypt salt (8 rounds) |
| `avatar` | string (URL) | ✅ | Cloudinary URL | User profile picture |
| `cover` | string (URL) | ✅ | Cloudinary URL | User cover photo |
| `bio` | string | ✅ | Max 255 chars | User bio/description |
| `websiteUrl` | string (URL) | ✅ | | User website link |
| `role` | `UserRole` (enum) | ❌ | Default: `USER` | `USER` or `ADMIN` |
| `status` | `Status` (enum) | ❌ | Default: `ACTIVE` | Account status |
| `followerCount` | number | ✅ | Default: 0 | Cached follower count (updated via Redis events) |
| `postCount` | number | ✅ | Default: 0 | Cached post count (updated via Redis events) |
| `createdAt` | Date | ❌ | | Account creation timestamp |
| `updatedAt` | Date | ❌ | | Last profile update timestamp |

**Sensitive fields** (stripped from API responses):
- `password` — never sent to client
- `salt` — never sent to client

### Validation Schemas (Zod)

#### `userSchema` → `User`
Complete entity schema with all validations.

#### `userRegistrationDTOSchema` → `UserRegistrationDTO`
Input for user registration:
```typescript
{
  firstName: string       // min 2 chars
  lastName: string        // min 2 chars
  username: string        // 3-25 chars, alphanumeric + underscore
  password: string        // min 6 chars
}
```

#### `userLoginDTOSchema` → `UserLoginDTO`
Input for login:
```typescript
{
  username: string        // required
  password: string        // required
}
```

#### `userUpdateDTOSchema` → `UserUpdateDTO`
Partial user update (all fields optional, admin-level):
```typescript
{
  avatar?: string
  cover?: string
  firstName?: string
  lastName?: string
  email?: string
  password?: string       // will be hashed on update
  bio?: string
  websiteUrl?: string
  salt?: string           // set internally when password changes
  role?: UserRole
  status?: Status
}
```

#### `userUpdateProfileDTOSchema` → `UserUpdateProfileDTO`
Partial user update for self-profile (strips `role` and `status`):
```typescript
{
  avatar?: string
  cover?: string
  firstName?: string
  lastName?: string
  email?: string
  password?: string       // will be hashed on update
  bio?: string
  websiteUrl?: string
}
```

#### `userCondDTOSchema` → `UserCondDTO`
Query filter conditions (all optional):
```typescript
{
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  role?: UserRole
  status?: Status
}
```

### Password Reset Schemas

#### `resetTokenSchema` → `ResetToken`
In-memory representation of a password reset token:
```typescript
{
  id: string              // UUID v7
  userId: string          // References user
  token: string           // Cryptographically random (32 bytes hex)
  expiresAt: Date         // +1 hour from creation
  isUsed: boolean         // Marked true after password reset
  createdAt: Date
}
```

#### `createResetTokenDTOSchema` → `CreateResetTokenDTO`
Input to create a reset token:
```typescript
{
  userId: string
  token: string
  expiresAt: Date
}
```

#### `requestResetDTOSchema` → `RequestResetDTO`
User requests password reset by email:
```typescript
{
  email: string           // must be valid email format
}
```

#### `resetPasswordDTOSchema` → `ResetPasswordDTO`
User resets password with token:
```typescript
{
  token: string           // reset token from email
  password: string        // min 6 chars
  confirmPassword: string // must match password (Zod refinement)
}
```

### Domain Errors

All errors defined in `model/error.ts`:

| Error | Message | HTTP Status (implied) |
|-------|---------|----------------------|
| `ErrFirstNameAtLeast2Chars` | "First name must be at least 2 characters" | 400 |
| `ErrLastNameAtLeast2Chars` | "Last name must be at least 2 characters" | 400 |
| `ErrUsernameInvalid` | "Username must contain only letters, numbers and underscore (_)" | 400 |
| `ErrPasswordAtLeast6Chars` | "Password must be at least 6 characters" | 400 |
| `ErrRoleInvalid` | "Role is invalid" | 400 |
| `ErrUsernameExisted` | "Username is already existed" | 400 |
| `ErrInvalidUsernameAndPassword` | "Invalid username and password" | 400 |
| `ErrUserInactivated` | "User is inactivated or banned" | 403 |
| `ErrInvalidToken` | "Invalid token" | 401 |

---

## Interface Layer

All contracts are defined in `interface/index.ts`. Interfaces describe the boundaries between layers.

### IUserUseCase

Extends `IUseCase<UserRegistrationDTO, UserUpdateDTO, User, UserCondDTO>` with domain-specific operations.

**CRUD Operations** (inherited from `IUseCase`):
```typescript
create(data: UserRegistrationDTO): Promise<string>
  // Delegate to register(); returns new user ID

getDetail(id: string): Promise<User | null>
  // Fetch user by ID; throws ErrNotFound if deleted or not found

list(cond: UserCondDTO, paging: PagingDTO): Promise<Paginated<User>>
  // Query with filters and pagination; excludes DELETED users

update(id: string, data: UserUpdateDTO): Promise<boolean>
  // Admin-level update (allows role/status change); hashes password if provided

delete(id: string): Promise<boolean>
  // Soft delete (sets status to DELETED); throws if already deleted
```

**Authentication & Authorization**:
```typescript
login(data: UserLoginDTO): Promise<string>
  // Authenticate user with username/password; returns JWT token
  // Throws: ErrInvalidUsernameAndPassword, ErrUserInactivated

register(data: UserRegistrationDTO): Promise<string>
  // Create new user; returns user ID
  // Throws: ErrUsernameExisted
```

**Profile Management**:
```typescript
profile(userId: string): Promise<User>
  // Fetch user profile by ID; throws ErrNotFound if deleted

updateProfile(requester: Requester, data: UserUpdateDTO): Promise<boolean>
  // User updates own profile (cannot change role/status)
  // Throws: ErrUserInactivated, ErrForbidden
```

**Token Operations**:
```typescript
verifyToken(token: string): Promise<TokenPayload>
  // Validate JWT and check user still exists & is ACTIVE
  // Returns: { sub: userId, role: UserRole }
  // Throws: ErrInvalidToken
```

**Batch Operations**:
```typescript
listByIds(ids: string[]): Promise<User[]>
  // Fetch multiple users; strips password/salt from response
```

**Password Operations** (public, used by other modules):
```typescript
verifyPassword(plainPassword: string, storedHash: string): Promise<boolean>
  // Compare plain text against bcrypt hash; returns boolean

hashPassword(password: string): Promise<{ hash: string; salt: string }>
  // Hash password with bcrypt (8 salt rounds); returns hash + salt
  // Used by register, password reset, password change flows
```

### IPasswordResetUsecase

Password reset workflow contract.

```typescript
requestReset(data: RequestResetDTO): Promise<boolean>
  // 1. Find user by email
  // 2. Check user is ACTIVE
  // 3. Generate reset token (crypto.randomBytes(32).toString('hex'))
  // 4. Create token with 1-hour expiration
  // 5. Send email with reset link
  // Throws: ErrUserNotFound, ErrEmailNotSent

resetPassword(data: ResetPasswordDTO): Promise<boolean>
  // 1. Validate token exists, not used, and not expired
  // 2. Find user from token.userId
  // 3. Hash new password
  // 4. Update user password + invalidate all tokens (parallel)
  // Throws: ErrInvalidToken
```

### IUserStatsUsecase

User statistics aggregation.

```typescript
getUserStats(userId: string): Promise<UserStats>
  // Returns aggregated stats for user
  // Throws: ErrUserNotFound
```

**UserStats DTO**:
```typescript
{
  id: string              // User UUID
  username: string        // User's username
  followerCount: number   // Count of followers
  followingCount: number  // Count of users being followed
  postCount: number       // Count of posts created
  totalLikes: number      // Total likes on all user's posts
}
```

### UserCounterFields

Strict type alias for fields that can be atomically incremented/decremented:
```typescript
type UserCounterFields = 'followerCount' | 'postCount'
```
This prevents typos and ensures only valid database columns can be mutated.

### IUserCommandRepository

Write-only operations with atomic counter support.

Extends `ICommandRepository<User, UserUpdateDTO, UserCondDTO>`:
```typescript
insert(data: User): Promise<boolean>
  // Create new user; throws on unique constraint violation (409)

update(id: string, data: UserUpdateDTO): Promise<boolean>
  // Update user fields; throws 404 if not found

delete(id: string, isHard?: boolean): Promise<boolean>
  // Soft delete (status → DELETED) or hard delete; throws 404 if not found

deleteByCond(cond: UserCondDTO, isHard?: boolean): Promise<boolean>
  // Batch delete by conditions
```

**Atomic Counter Operations**:
```typescript
incrementCount(id: string, field: UserCounterFields, step: number): Promise<boolean>
  // Atomically increment followerCount or postCount
  // Example: await repository.incrementCount(userId, 'followerCount', 1)

decrementCount(id: string, field: UserCounterFields, step: number): Promise<boolean>
  // Atomically decrement followerCount or postCount
```

---

## UseCase Layer

Business logic and workflow orchestration. Each use case encapsulates a single area of responsibility.

### UserUseCase

**File:** `usecase/index.ts`

**Implements:** `IUserUseCase`

**Dependency:**
```typescript
constructor(
  private readonly repository: IRepository<User, UserCondDTO, UserUpdateDTO>
)
```

**Private Helper — Type Guard:**

```typescript
private requireActiveUser(user: User | null): asserts user is User
  // Validates user exists and has status === ACTIVE
  // If not, throws ErrUserInactivated
  // TypeScript now knows after this call that user is non-null User
  // Usage: this.requireActiveUser(user); // user is now safely User
```

This TypeScript `asserts` keyword ensures type safety — after the call, the type system knows `user` is not null.

**Method: login**

```typescript
async login(data: UserLoginDTO): Promise<string>
  1. Validate input DTO against userLoginDTOSchema
  2. findByCond({ username: dto.username })
     → if null, throw ErrInvalidUsernameAndPassword (400)
  3. Call requireActiveUser(user)
     → if status !== ACTIVE, throw ErrUserInactivated (403)
  4. verifyPassword(dto.password, user.password)
     → if false, throw ErrInvalidUsernameAndPassword (400)
  5. jwtProvider.generateToken({ sub: user.id, role: user.role })
     → Returns JWT with 7-day expiry
  Return: JWT token string
```

**Method: register**

```typescript
async register(data: UserRegistrationDTO): Promise<string>
  1. Validate input DTO against userRegistrationDTOSchema
  2. findByCond({ username: dto.username })
     → if exists, throw ErrUsernameExisted (400)
  3. hashPassword(dto.password)
     → Returns { hash, salt } (bcrypt 8 rounds)
  4. Create User object:
     {
       id: v7(),                       // UUID v7
       ...dto,                         // firstName, lastName, username
       password: hash,
       salt,
       status: Status.ACTIVE,
       role: UserRole.USER,
       createdAt: new Date(),
       updatedAt: new Date()
     }
  5. repository.insert(newUser)
  Return: newId (user ID string)
```

**Method: updateProfile (User)**

```typescript
async updateProfile(requester: Requester, data: UserUpdateDTO): Promise<boolean>
  1. Validate input DTO against userUpdateProfileDTOSchema
     (omits role and status — user cannot change these)
  2. repository.findById(requester.sub)
  3. Call requireActiveUser(user)
  4. If dto.password:
       { hash, salt } = await hashPassword(dto.password)
       dto.salt = salt
       dto.password = hash
  5. repository.update(requester.sub, dto)
  Return: true
```

**Method: update (Admin)**

```typescript
async update(id: string, data: UserUpdateDTO): Promise<boolean>
  1. Validate input DTO against userUpdateDTOSchema (includes role/status)
  2. repository.findById(id)
  3. Call requireActiveUser(user)
  4. If dto.password: hash and set salt
  5. repository.update(id, dto)
  Return: true
```

**Method: verifyToken**

```typescript
async verifyToken(token: string): Promise<TokenPayload>
  1. jwtProvider.verifyToken(token)
     → Returns payload or null
  2. if (!payload), throw ErrInvalidToken (401)
  3. repository.findById(payload.sub)
     (Live DB check — ensure user still exists)
  4. Call requireActiveUser(user)
     (Ensure user hasn't been deleted/banned/deactivated)
  Return: { sub: user.id, role: user.role }

Security: Even if JWT is valid, the user must be active in the database.
  This ensures deleted/banned users can't keep using old tokens.
```

**Method: listByIds**

```typescript
async listByIds(ids: string[]): Promise<User[]>
  1. repository.listByIds(ids)
  2. Map each user: strip password and salt
  Return: User[] without sensitive fields
```

**Method: hashPassword**

```typescript
async hashPassword(password: string): Promise<{ hash: string; salt: string }>
  1. salt = await bcrypt.genSalt(8)
  2. hash = await bcrypt.hash(password, salt)
  Return: { hash, salt }

Bcrypt Parameters:
  - 8 rounds for salt generation (balances security + speed)
  - 10 rounds implicitly for hashing
```

**Method: verifyPassword**

```typescript
async verifyPassword(plainPassword: string, storedHash: string): Promise<boolean>
  1. return await bcrypt.compare(plainPassword, storedHash)
  
Returns: boolean (true if match, false otherwise)
```

### PasswordResetUsecase

**File:** `usecase/password-reset.usecase.ts`

**Implements:** `IPasswordResetUsecase`

**Dependencies:**
```typescript
constructor(
  private readonly resetTokenRepo: IResetTokenRepository,
  private readonly emailService: IEmailService,
  private readonly userUseCase: IUserUseCase  // Uses IUserUseCase, not raw repository
)
```

**Why inject `IUserUseCase`?**
- Single source of truth for password operations (hashing)
- DRY principle — avoids duplicating password logic
- Consistent hashing algorithm across all flows (register, reset, password change)
- Better abstraction — doesn't couple to data layer
- Automatic validation/hooks if added later

**Method: requestReset**

```typescript
async requestReset(data: RequestResetDTO): Promise<boolean>
  1. Validate email DTO against requestResetDTOSchema
  2. userUseCase.list({ email: dto.email }, { page: 1, limit: 1 })
     → Find user by email
  3. if (!user), throw ErrUserNotFound (404)
  4. if (user.status !== Status.ACTIVE)
       → throw ErrForbidden ("Cannot reset password for inactive user")
  5. Generate reset token:
       token = crypto.randomBytes(32).toString('hex')
  6. Calculate expiration:
       expiresAt = new Date()
       expiresAt.setHours(expiresAt.getHours() + 1)  // +1 hour
  7. resetTokenRepo.createToken({ userId: user.id, token, expiresAt })
     (This internally invalidates all existing tokens for the user)
  8. if (!user.email), throw ErrEmailNotSent ("User has no email address")
  9. emailService.sendPasswordResetEmail(user.email, token)
  10. if (!emailSent), throw ErrEmailNotSent
  Return: true

Security: Always returns generic "check your email" message to client,
  whether user exists or not (prevents user enumeration attacks).
```

**Method: resetPassword**

```typescript
async resetPassword(data: ResetPasswordDTO): Promise<boolean>
  1. Validate DTO against resetPasswordDTOSchema
     (Zod refinement ensures password === confirmPassword)
  2. resetTokenRepo.findByToken(dto.token)
  3. Check token validity:
       if (!resetToken || resetToken.isUsed || resetToken.expiresAt < now)
         → throw ErrInvalidToken (401)
  4. userUseCase.getDetail(resetToken.userId)
     (Ensures user exists; throws ErrNotFound if deleted)
  5. Hash new password:
       { hash, salt } = await userUseCase.hashPassword(dto.password)
  6. Parallel operations (Promise.all):
       [
         userUseCase.update(resetToken.userId, { password: hash, salt }),
         resetTokenRepo.invalidateUserTokens(resetToken.userId),
         resetTokenRepo.markAsUsed(resetToken.id)
       ]
  Return: true

Why Promise.all? Performance: All three operations are independent and
  can execute concurrently (db update + token cleanup + mark used).
```

### UserStatsUsecase

**File:** `usecase/user-stats.usecase.ts`

**Implements:** `IUserStatsUsecase`

**Note:** Uses Prisma directly (not through repository abstraction). This is acceptable for complex aggregation queries that don't fit the standard repository pattern.

**Method: getUserStats**

```typescript
async getUserStats(userId: string): Promise<UserStats>
  1. prisma.users.findUnique({ where: { id: userId } })
     → if not found, throw ErrUserNotFound (404)

  2. Run 4 queries in parallel via Promise.all:
       [
         prisma.follow.count({ where: { followingId: userId } }),
           // Count users following this user (followers)
         
         prisma.follow.count({ where: { followerId: userId } }),
           // Count users this user follows (following)
         
         prisma.posts.count({ where: { authorId: userId } }),
           // Count posts by this user
         
         prisma.posts.findMany({
           where: { authorId: userId },
           select: { id: true }
         })
           // Fetch post IDs for like counting
       ]

  3. Extract post IDs: postIds = posts.map(p => p.id)

  4. Count total likes:
       if (postIds.length > 0)
         totalLikes = await prisma.postLikes.count({
           where: { postId: { in: postIds } }
         })
       else
         totalLikes = 0

  Return: {
    id: user.id,
    username: user.username,
    followerCount,
    followingCount,
    postCount,
    totalLikes
  }

Performance: Promise.all ensures all 4 queries run concurrently,
  then a second query counts likes only if posts exist.
```

---

## Infrastructure Layer

### Repository Pattern (CQRS)

The repository layer implements **Command Query Responsibility Segregation (CQRS)** — separating read (Query) from write (Command) operations.

**Files:** `infras/repository/index.ts`

#### PrismaUserQueryRepository

Read-only operations. No side effects.

```typescript
async findById(id: string): Promise<User | null>
  → prisma.users.findUnique({ where: { id } })
  → Casts role to UserRole enum
  → Returns User | null

async findByCond(condition: UserCondDTO): Promise<User | null>
  → prisma.users.findFirst({ where: condition })
  → First match only
  → Returns User | null

async list(cond: UserCondDTO, paging: PagingDTO): Promise<Paginated<User>>
  1. Build condition: { ...cond, NOT: { status: Status.DELETED } }
     (Excludes soft-deleted users)
  2. Calculate skip: (page - 1) * limit
  3. Use prisma.$transaction() for concurrent count + query:
       [
         prisma.users.count({ where: condition }),
         prisma.users.findMany({
           where: condition,
           take: paging.limit,
           skip,
           orderBy: { createdAt: 'desc' }
         })
       ]
  Return: {
    data: User[],
    paging: PagingDTO,
    total: number
  }

  Performance: prisma.$transaction() runs both queries concurrently,
    avoiding the "waterfall" of sequential count + fetch.

async listByIds(ids: string[]): Promise<User[]>
  → prisma.users.findMany({ where: { id: { in: ids } } })
  → Returns array of users
```

#### PrismaUserCommandRepository

Write-only operations. Implements error translation.

```typescript
async insert(data: User): Promise<boolean>
  1. prisma.users.create({ data })
  2. Catch Prisma errors:
       P2002 (Unique Constraint) → throw AppError(409, "User data already exists")
  Return: true

async update(id: string, data: UserUpdateDTO): Promise<boolean>
  1. prisma.users.update({ where: { id }, data })
  2. Catch Prisma errors:
       P2002 → throw AppError(409, "User data already exists")
       P2025 (Not Found) → throw AppError(404, "User not found")
  Return: true

async delete(id: string, isHard?: boolean): Promise<boolean>
  1. if (isHard)
       → prisma.users.delete({ where: { id } })  // Hard delete
     else
       → prisma.users.update({
           where: { id },
           data: { status: 'deleted' }  // Soft delete
         })
  2. Catch P2025 (Not Found) → throw AppError(404)
  Return: true

async deleteByCond(cond: UserCondDTO, isHard?: boolean): Promise<boolean>
  1. if (isHard)
       → prisma.users.deleteMany({ where: cond })
     else
       → prisma.users.updateMany({
           where: cond,
           data: { status: 'deleted' }
         })
  Return: true

  ⚠️ TODO: Should return true only if affectedRows > 0

async incrementCount(id: string, field: UserCounterFields, step: number): Promise<boolean>
  1. prisma.users.update({
       where: { id },
       data: { [field]: { increment: step } }
     })
  2. Catch P2025 → throw AppError(404, "User not found")
  Return: true

  Used by: Redis consumer when user is followed/user posts created

async decrementCount(id: string, field: UserCounterFields, step: number): Promise<boolean>
  1. prisma.users.update({
       where: { id },
       data: { [field]: { decrement: step } }
     })
  2. Catch P2025 → throw AppError(404)
  Return: true

  Used by: Redis consumer when user is unfollowed/user posts deleted
```

#### PrismaUserRepository (CQRS Facade)

Combines Query and Command repositories. Clients use this, not the individual repos.

```typescript
class PrismaUserRepository implements IRepository<User, UserCondDTO, UserUpdateDTO> {
  constructor(
    private readonly queryRepository: IQueryRepository<User, UserCondDTO>,
    private readonly commandRepository: ICommandRepository<User, UserUpdateDTO>
  ) {}

  // All methods delegate to appropriate repository
  findById(id: string) → queryRepository.findById(id)
  findByCond(cond) → queryRepository.findByCond(cond)
  list(cond, paging) → queryRepository.list(cond, paging)
  listByIds(ids) → queryRepository.listByIds(ids)
  insert(data) → commandRepository.insert(data)
  update(id, data) → commandRepository.update(id, data)
  delete(id, isHard) → commandRepository.delete(id, isHard)
}
```

#### PrismaResetTokenRepository

Stores and manages password reset tokens.

**⚠️ Currently in-memory mock** — tokens are lost on server restart.

```typescript
private tokens: ResetToken[] = []

async createToken(data: CreateResetTokenDTO): Promise<ResetToken>
  1. Invalidate all existing tokens for userId first
  2. Create new token with uuid v7
  3. Push to in-memory array
  Return: ResetToken

async findByToken(token: string): Promise<ResetToken | null>
  → Find token in array by token string
  Return: ResetToken | null

async markAsUsed(id: string): Promise<boolean>
  → Find token by id, set isUsed = true
  Return: true if found, false otherwise

async invalidateUserTokens(userId: string): Promise<boolean>
  → Set all tokens for userId with isUsed = false to isUsed = true
  Return: true
```

**TODO:** Add Prisma model `PasswordResetTokens` to schema:
```prisma
model PasswordResetTokens {
  id        String    @id @default(cuid())
  userId    String    @db.VarChar(36)
  token     String    @unique
  expiresAt DateTime
  isUsed    Boolean   @default(false)
  createdAt DateTime  @default(now())

  user Users @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

### Email Service

**File:** `infras/services/email.service.ts`

**Interface:**
```typescript
interface IEmailService {
  sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean>
}
```

**Implementation:**
```typescript
class EmailService implements IEmailService {
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean>
    1. Construct reset link:
         resetLink = `${frontendUrl}/reset-password?token=${resetToken}`
         (frontendUrl currently hardcoded to http://localhost:3000)

    2. Build email subject + body:
         subject = "Reset Your Password - Social Network"
         body = HTML email with reset link + expiration info

    3. Try to send email:
         → Currently logs to console (mock)
         → In production: use nodemailer or SendGrid

    4. Catch errors:
         → Log error, return false

    Return: true if successful, false otherwise
}
```

**⚠️ Known Limitations:**
- Hardcoded frontend URL (should come from config)
- No actual email sending (nodemailer not integrated)
- Logs to console instead of email provider

### HTTP Transport Layer

#### UserHTTPService

**File:** `infras/transport/index.ts`

Extends `BaseHttpService<User, UserRegistrationDTO, UserUpdateDTO, UserCondDTO>`.

**Base CRUD Handlers** (from `BaseHttpService`, delegated to usecase):
```typescript
async createAPI(req, res)
  → usecase.create(req.body) → returns userId
  
async listAPI(req, res)
  → usecase.list(query conditions, paging params)
  → returns paginated list

async updateAPI(req, res)
  → usecase.update(req.params.id, req.body)
  
async deleteAPI(req, res)
  → usecase.delete(req.params.id)
```

**Domain-Specific Handlers:**

```typescript
async registerAPI(req: Request, res: Response)
  → Delegate to createAPI (wrapper)

async loginAPI(req: Request, res: Response)
  1. usecase.login(req.body)
  2. res.status(200).json({ data: token })

async profileAPI(req: Request, res: Response)
  1. Extract JWT from Authorization header
  2. jwtProvider.verifyToken(token)
  3. usecase.profile(payload.sub)
  4. Strip password/salt
  5. successResponse(user, res)

async updateProfileAPI(req: Request, res: Response)
  1. Extract JWT from Authorization header
  2. jwtProvider.verifyToken(token)
  3. usecase.updateProfile(requester, req.body)
  4. successResponse(true, res)

async introspectAPI(req: Request, res: Response)  [RPC Internal]
  1. Extract token from req.body.token
  2. usecase.verifyToken(token)
  3. successResponse(payload, res)
     Returns: { sub: userId, role: UserRole }

async getDetailAPI(req: Request, res: Response)
  1. Extract ID from req.params.id
  2. usecase.getDetail(id)
  3. Strip password/salt
  4. successResponse(user, res)

async getByIdAPI(req: Request, res: Response)  [RPC Internal]
  → Same as getDetailAPI (RPC version)

async listByIdsAPI(req: Request, res: Response)  [RPC Internal]
  1. Extract ids array from req.body.ids
  2. usecase.listByIds(ids)
  3. Strip password/salt from each user
  4. successResponse(users, res)
```

#### PasswordResetHttpService

**File:** `infras/transport/password-reset-http.service.ts`

```typescript
async requestResetAPI(req: Request, res: Response)
  1. usecase.requestReset(req.body)
  2. Catch any error
  3. Always return success (generic "check your email" message)
     for security — prevent user enumeration
  
  Security: Even if user doesn't exist or email fails, client sees:
    { message: "If your email is registered, you will receive..." }

async resetPasswordAPI(req: Request, res: Response)
  1. usecase.resetPassword(req.body)
  2. successResponse({ message: "Password reset successful" }, res)
```

#### UserStatsHttpService

**File:** `infras/transport/user-stats-http.service.ts`

```typescript
async getUserStatsAPI(req: Request, res: Response)
  1. Extract userId from req.params.userId
  2. usecase.getUserStats(userId)
  3. successResponse(stats, res)
```

### Redis Consumer

**File:** `infras/transport/redis-consumer.ts`

Listens to domain events and updates user counters.

```typescript
class RedisUserConsumer {
  constructor(
    private readonly repository: IUserCommandRepository
  ) {}

  async handleUserFollowed(evt: FollowedEvent)
    → repository.incrementCount(evt.payload.followingId, 'followerCount', 1)

  async handleUserUnfollowed(evt: UnfollowedEvent)
    → repository.decrementCount(evt.payload.followingId, 'followerCount', 1)

  async handleUserPostCreated(evt: PostCreatedEvent)
    → repository.incrementCount(evt.payload.userId, 'postCount', 1)

  async handleUserPostDeleted(evt: PostDeletedEvent)
    → repository.decrementCount(evt.payload.userId, 'postCount', 1)

  subscribe()
    → RedisClient.getInstance().subscribe(EvtFollowed, handler)
    → RedisClient.getInstance().subscribe(EvtUnfollowed, handler)
    → RedisClient.getInstance().subscribe(EvtPostCreated, handler)
    → RedisClient.getInstance().subscribe(EvtPostDeleted, handler)
}
```

**Events Listened:**
- `EvtFollowed` (from Follow module) — increment follower count
- `EvtUnfollowed` — decrement follower count
- `EvtPostCreated` (from Post module) — increment post count
- `EvtPostDeleted` — decrement post count

---

## Data Flow Workflows

### 1. Registration Flow

```
┌─ Client
│  POST /register
│  {
│    firstName: "John",
│    lastName: "Doe",
│    username: "johndoe",
│    password: "secret123"
│  }
│
├─ UserHTTPService.registerAPI()
│  └─ calls createAPI() → usecase.create() → usecase.register()
│
├─ UserUseCase.register()
│  ├─ 1. Zod validate userRegistrationDTOSchema
│  ├─ 2. findByCond({ username: "johndoe" })
│  │  └─ If exists: throw ErrUsernameExisted (400)
│  ├─ 3. hashPassword("secret123")
│  │  └─ bcrypt.genSalt(8) + bcrypt.hash(password, salt)
│  │  └─ Returns { hash, salt }
│  ├─ 4. Build User object:
│  │    {
│  │      id: uuid-v7,
│  │      firstName: "John",
│  │      lastName: "Doe",
│  │      username: "johndoe",
│  │      password: hash,
│  │      salt: salt,
│  │      role: USER,
│  │      status: ACTIVE,
│  │      createdAt: now(),
│  │      updatedAt: now()
│  │    }
│  └─ 5. repository.insert(user)
│
├─ PrismaUserCommandRepository.insert()
│  └─ prisma.users.create({ data: user })
│  └─ Catch P2002 (Unique Constraint) → throw 409
│
├─ Prisma ORM
│  └─ INSERT INTO users (id, firstName, lastName, ...) VALUES (...)
│
└─ MySQL
   └─ Row inserted into `users` table
   
Response: 
  200 OK
  { data: "<new-user-id>" }
```

### 2. Login Flow

```
┌─ Client
│  POST /authenticate
│  { username: "johndoe", password: "secret123" }
│
├─ UserHTTPService.loginAPI()
│  └─ usecase.login(req.body)
│
├─ UserUseCase.login()
│  ├─ 1. Zod validate userLoginDTOSchema
│  ├─ 2. findByCond({ username: "johndoe" })
│  │  ├─ PrismaUserQueryRepository.findByCond()
│  │  └─ prisma.users.findFirst({ where: { username: "johndoe" } })
│  │  └─ If null: throw ErrInvalidUsernameAndPassword (400)
│  │
│  ├─ 3. requireActiveUser(user)
│  │  └─ if (user.status !== ACTIVE): throw ErrUserInactivated (403)
│  │
│  ├─ 4. verifyPassword("secret123", user.password)
│  │  └─ bcrypt.compare(plainPassword, storedHash)
│  │  └─ If false: throw ErrInvalidUsernameAndPassword (400)
│  │
│  └─ 5. jwtProvider.generateToken({ sub: user.id, role: user.role })
│     └─ Signs JWT with jwtSecret, 7-day expiry
│     └─ Returns: eyJhbGc....[token string]
│
└─ Response:
   200 OK
   { data: "[jwt-token-string]" }

Client then uses JWT in Authorization header for subsequent requests:
  Authorization: Bearer [jwt-token-string]
```

### 3. Token Introspect (RPC) — Internal Service Communication

```
┌─ Other Service (e.g., Post module)
│  Validates JWT from client request
│  POST /rpc/introspect
│  { token: "[jwt-token-string]" }
│
├─ UserHTTPService.introspectAPI()
│  └─ usecase.verifyToken(token)
│
├─ UserUseCase.verifyToken()
│  ├─ 1. jwtProvider.verifyToken(token)
│  │  └─ jsonwebtoken.verify(token, secret)
│  │  └─ Validates signature + expiration
│  │  └─ Extracts { sub, role }
│  │  └─ If invalid: returns null
│  │
│  ├─ 2. if (!payload): throw ErrInvalidToken (401)
│  │
│  ├─ 3. repository.findById(payload.sub)
│  │  ├─ PrismaUserQueryRepository.findById()
│  │  └─ Live DB check: ensure user still exists
│  │
│  └─ 4. requireActiveUser(user)
│     └─ if (!user || status !== ACTIVE): throw ErrUserInactivated (403)
│     └─ Ensures deleted/banned users can't use old tokens
│
└─ Response:
   200 OK
   { data: { sub: "[user-id]", role: "[admin|user]" } }

Security: Even if JWT is cryptographically valid, the user must be:
  1. Still in the database
  2. Not deleted
  3. Not banned
  4. Status === ACTIVE
```

### 4. Password Reset Flow

#### Phase 1: Request Reset

```
┌─ Client
│  POST /forgot-password
│  { email: "john@example.com" }
│
├─ PasswordResetHttpService.requestResetAPI()
│  └─ usecase.requestReset(req.body)
│
├─ PasswordResetUsecase.requestReset()
│  ├─ 1. Zod validate requestResetDTOSchema
│  │
│  ├─ 2. userUseCase.list({ email: "john@example.com" }, { page: 1, limit: 1 })
│  │  ├─ PrismaUserQueryRepository.list()
│  │  └─ prisma.users.findMany({ where: { email }, take: 1 })
│  │  └─ If not found: throw ErrUserNotFound (404)
│  │
│  ├─ 3. if (user.status !== ACTIVE)
│  │  └─ throw ErrForbidden ("Cannot reset password for inactive user")
│  │
│  ├─ 4. Generate secure reset token:
│  │  └─ token = crypto.randomBytes(32).toString('hex')
│  │  └─ Produces 64-char hex string (256 bits entropy)
│  │
│  ├─ 5. Calculate expiration:
│  │  └─ expiresAt = new Date() + 1 hour
│  │
│  ├─ 6. resetTokenRepo.createToken({ userId, token, expiresAt })
│  │  ├─ Invalidates all existing tokens for userId first
│  │  └─ Stores new token in-memory
│  │
│  ├─ 7. emailService.sendPasswordResetEmail(user.email, token)
│  │  ├─ Constructs reset link: http://localhost:3000/reset-password?token=...
│  │  └─ Currently logs to console (mock implementation)
│  │
│  └─ 8. Return true
│
└─ Response:
   200 OK
   {
     message: "If your email is registered, you will receive a password reset link"
   }
   
Security: Same response whether email exists or not (prevents user enumeration).
```

#### Phase 2: Reset Password

```
┌─ Client
│  POST /reset-password
│  {
│    token: "[64-char-reset-token]",
│    password: "newpassword123",
│    confirmPassword: "newpassword123"
│  }
│
├─ PasswordResetHttpService.resetPasswordAPI()
│  └─ usecase.resetPassword(req.body)
│
├─ PasswordResetUsecase.resetPassword()
│  ├─ 1. Zod validate resetPasswordDTOSchema
│  │  └─ Refinement: password === confirmPassword
│  │
│  ├─ 2. resetTokenRepo.findByToken(token)
│  │  └─ Search in-memory tokens for token string
│  │  └─ If not found: throw ErrInvalidToken (401)
│  │
│  ├─ 3. Validate token state:
│  │  ├─ if (resetToken.isUsed): throw ErrInvalidToken
│  │  │  (Token already used once)
│  │  ├─ if (resetToken.expiresAt < now): throw ErrInvalidToken
│  │  │  (Token expired beyond 1 hour)
│  │
│  ├─ 4. userUseCase.getDetail(resetToken.userId)
│  │  └─ Fetch user; ensure not deleted
│  │  └─ If not found: throw ErrNotFound (404)
│  │
│  ├─ 5. userUseCase.hashPassword("newpassword123")
│  │  └─ bcrypt.genSalt(8) + bcrypt.hash(password, salt)
│  │  └─ Returns { hash, salt }
│  │
│  └─ 6. Promise.all([
│       userUseCase.update(userId, { password: hash, salt }),
│       resetTokenRepo.invalidateUserTokens(userId),
│       resetTokenRepo.markAsUsed(resetToken.id)
│     ])
│     (All 3 operations run concurrently)
│
│     ├─ Update password in DB
│     ├─ Mark all tokens as used
│     └─ Mark this token as used
│
└─ Response:
   200 OK
   { message: "Password reset successful" }

User must now log in with new password.
```

### 5. Redis Event-Driven Counter Sync

```
┌─ Follow Module
│  User A follows User B
│  RedisClient.publish(EvtFollowed, { followingId: B, followerId: A })
│
├─ Redis Pub/Sub
│  Channel: "EvtFollowed"
│  Message: { _id, _eventName, _payload: { followingId, followerId }, ... }
│
├─ RedisUserConsumer.subscribe()
│  Listener receives message on "EvtFollowed" channel
│
├─ RedisUserConsumer.handleUserFollowed()
│  └─ repository.incrementCount(followingId, 'followerCount', 1)
│
├─ PrismaUserCommandRepository.incrementCount()
│  └─ prisma.users.update({
│       where: { id: followingId },
│       data: { followerCount: { increment: 1 } }
│     })
│
└─ MySQL UPDATE users SET followerCount = followerCount + 1 WHERE id = B

Similar flows:
  • EvtUnfollowed → decrementCount('followerCount', 1)
  • EvtPostCreated → incrementCount('postCount', 1)
  • EvtPostDeleted → decrementCount('postCount', 1)

Benefits:
  - Counters always in sync with database
  - Atomic updates (no race conditions)
  - Decoupled from Follow/Post modules
```

### 6. User Stats Aggregation

```
┌─ Client
│  GET /users/123/stats
│
├─ UserStatsHttpService.getUserStatsAPI()
│  └─ usecase.getUserStats("123")
│
├─ UserStatsUsecase.getUserStats()
│  ├─ 1. prisma.users.findUnique({ where: { id: "123" } })
│  │  └─ If not found: throw ErrUserNotFound (404)
│  │
│  └─ 2. Promise.all([
│       prisma.follow.count({ where: { followingId: "123" } }),
│       prisma.follow.count({ where: { followerId: "123" } }),
│       prisma.posts.count({ where: { authorId: "123" } }),
│       prisma.posts.findMany({
│         where: { authorId: "123" },
│         select: { id: true }
│       })
│     ])
│
│     Parallel queries:
│     1. COUNT(*) FROM follows WHERE followingId = 123  [followerCount]
│     2. COUNT(*) FROM follows WHERE followerId = 123   [followingCount]
│     3. COUNT(*) FROM posts WHERE authorId = 123       [postCount]
│     4. SELECT id FROM posts WHERE authorId = 123      [for like counting]
│
│  ├─ 3. Extract post IDs: [id1, id2, id3, ...]
│  │
│  ├─ 4. Count total likes:
│  │  └─ prisma.postLikes.count({
│  │       where: { postId: { in: [id1, id2, id3, ...] } }
│  │     })
│  │     COUNT(*) FROM postLikes WHERE postId IN (...)
│  │
│  └─ 5. Build response:
│
└─ Response:
   200 OK
   {
     data: {
       id: "123",
       username: "johndoe",
       followerCount: 150,
       followingCount: 42,
       postCount: 28,
       totalLikes: 512
     }
   }
```

---

## API Endpoints

All endpoints are prefixed with `/v1` and mounted in the Express app root.

| Method | Path | Auth | Roles | Description | Returns |
|--------|------|------|-------|-------------|---------|
| **POST** | `/register` | ❌ | — | Register new user | `{ data: "<user-id>" }` |
| **POST** | `/authenticate` | ❌ | — | Login with username/password | `{ data: "<jwt-token>" }` |
| **GET** | `/profile` | Manual JWT extract | — | Get own profile (client parses JWT) | `{ data: { ...user } }` |
| **PATCH** | `/profile` | Manual JWT extract | — | Update own profile | `{ data: true }` |
| **POST** | `/forgot-password` | ❌ | — | Request password reset email | `{ data: { message: "..." } }` |
| **POST** | `/reset-password` | ❌ | — | Reset password with token | `{ data: { message: "..." } }` |
| **GET** | `/users/:userId/stats` | ❌ | — | Get user statistics | `{ data: { id, username, ..., totalLikes } }` |
| **POST** | `/users` | ✅ | `ADMIN` | Create user (admin) | `{ data: "<user-id>" }` |
| **GET** | `/users/:id` | ❌ | — | Get user by ID | `{ data: { ...user } }` |
| **GET** | `/users` | ❌ | — | List users (paginated) | `{ data: [ ...users ], paging, total }` |
| **PATCH** | `/users/:id` | ✅ | `ADMIN` | Update user (admin) | `{ data: true }` |
| **DELETE** | `/users/:id` | ✅ | `ADMIN` | Soft delete user | `{ data: true }` |
| **POST** | `/rpc/introspect` | ❌ | — | Validate JWT (internal RPC) | `{ data: { sub, role } }` |
| **GET** | `/rpc/users/:id` | ❌ | — | Get user by ID (internal RPC) | `{ data: { ...user } }` |
| **POST** | `/rpc/users/list-by-ids` | ❌ | — | Batch fetch users (internal RPC) | `{ data: [ ...users ] }` |

**Auth Column Meanings:**
- ❌ = No authentication required
- ✅ = JWT Bearer token required (via middleware)

**Role-Based Access:**
- Admin routes (POST /users, PATCH /users/:id, DELETE /users/:id) check `allowRoles([UserRole.ADMIN])`

**Manual JWT Extraction (Profile Routes):**
- `/profile` and `/profile` (PATCH) extract JWT manually from `Authorization: Bearer <token>`
- They do NOT use the middleware (allows endpoint-level token validation with better error handling)

---

## Dependency Injection

**File:** `module.ts`

All components are wired together at module initialization. This enables:
- Loose coupling between layers
- Easy mocking for tests
- Single source of truth for dependencies

### Instantiation Graph

```
setupUserModule(sctx: ServiceContext)
  │
  ├─ PrismaUserQueryRepository
  │  └─ Used by PrismaUserRepository (readonly operations)
  │
  ├─ PrismaUserCommandRepository
  │  └─ Used by PrismaUserRepository (write operations)
  │
  ├─ PrismaUserRepository(queryRepo, commandRepo)
  │  └─ CQRS facade combining both repos
  │
  ├─ UserUseCase(repository)
  │  └─ Core business logic
  │  └─ Used by: UserHTTPService, PasswordResetUsecase, UserStatsUsecase
  │
  ├─ UserHTTPService(usecase)
  │  └─ HTTP handlers
  │  └─ Bound to Express routes
  │
  ├─ PrismaResetTokenRepository()
  │  └─ Reset token storage (in-memory mock)
  │
  ├─ EmailService()
  │  └─ Email sending (mock)
  │
  ├─ PasswordResetUsecase(resetTokenRepo, emailService, userUseCase)
  │  └─ Password reset workflow
  │  └─ Depends on UserUseCase for password hashing (DRY)
  │
  ├─ PasswordResetHttpService(passwordResetUsecase)
  │  └─ HTTP handlers for password reset
  │
  ├─ UserStatsUsecase()
  │  └─ User stats aggregation
  │
  ├─ UserStatsHttpService(userStatsUsecase)
  │  └─ HTTP handler for stats endpoint
  │
  ├─ RedisUserConsumer(commandRepository)
  │  └─ Event consumer
  │  └─ Subscribed to: EvtFollowed, EvtUnfollowed, EvtPostCreated, EvtPostDeleted
  │
  └─ Express Router
     ├─ Mounts all HTTP handlers
     ├─ Attaches middleware (auth, role guards)
     └─ Exports router for app.use('/v1', router)

setupUserConsumer(sctx: ServiceContext)
  └─ Creates RedisUserConsumer and calls .subscribe()
     (Called separately after setupUserModule)
```

### Why This Structure?

**Dependency Inversion:** High-level modules (UseCase) don't depend on low-level modules (Repository). Both depend on abstractions (Interfaces).

**Testability:** Replace `PrismaUserRepository` with a mock repository to test UseCase without a database.

**Flexibility:** Swap Prisma for raw SQL, Express for Fastify, without touching business logic.

---

## Known Issues & TODOs

### 1. In-Memory Reset Token Storage ⚠️

**File:** `infras/repository/reset-token.repository.ts`

**Issue:** `PrismaResetTokenRepository` stores tokens in memory (`private tokens: ResetToken[] = []`). Tokens are lost on server restart, and password reset doesn't work reliably in distributed systems.

**Fix:** Add Prisma model and migrate:
```prisma
model PasswordResetTokens {
  id        String    @id @default(cuid())
  userId    String    @db.VarChar(36)
  token     String    @unique @db.VarChar(255)
  expiresAt DateTime
  isUsed    Boolean   @default(false)
  createdAt DateTime  @default(now())

  user Users @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

Then update repository to use Prisma instead of array.

### 2. Email Service Not Integrated ⚠️

**File:** `infras/services/email.service.ts`

**Issue:** `EmailService` is a mock that logs to console. Actual email sending via nodemailer or SendGrid is not implemented.

**Fix:**
- Install `nodemailer` or use SendGrid SDK
- Configure SMTP credentials in `.env`
- Replace console logging with actual email sending

**Also:** Frontend URL is hardcoded to `http://localhost:3000`. Should come from config.

### 3. UserStatsUsecase Bypasses Repository Abstraction ⚠️

**File:** `usecase/user-stats.usecase.ts`

**Issue:** Uses Prisma directly instead of repository pattern, breaking the abstraction.

**Why:** Complex aggregation queries don't fit the standard repository interface. Can be acceptable for now.

**Fix (Future):** Add `IStatsRepository` interface with aggregation methods.

### 4. Enum Type Casting (Unsafe at Runtime) ⚠️

**File:** `infras/repository/index.ts`

**Issue:** Repositories blindly cast strings to enums:
```typescript
return { ...data, role: data.role as UserRole } as User
```

This bypasses runtime validation. If dirty data manually enters the DB, TypeScript won't catch it until runtime.

**Fix:** Parse outbound data with Zod:
```typescript
return userSchema.parse(data);
```

### 5. deleteByCond Doesn't Validate Affected Rows ⚠️

**File:** `infras/repository/index.ts` (line 118)

**Issue:**
```typescript
async deleteByCond(cond: UserCondDTO, isHard?: boolean): Promise<boolean> {
  // ... deleteMany or updateMany
  return true;  // ⚠️ Returns true even if 0 rows matched
}
```

**Fix:** Check `affectedRows.count > 0`:
```typescript
const result = await prisma.users.updateMany({...});
return result.count > 0;
```

### 6. Avatar Upload Incomplete ⚠️

**From:** `PLAN.md` in project root

**Issue:** `PATCH /profile` avatar upload endpoint exists but file upload integration is incomplete.

**Fix:** Integrate Cloudinary file upload service (already exists in `shared/services/cloudinary.service.ts`).

### 7. Pagination Performance Could Be Optimized ⚠️

**File:** `infras/repository/index.ts` (line 157)

**Current:** Uses separate `count()` and `findMany()` queries.

**Better:** Use `findMany()` with `skip/take` and follow-up count only if needed, or use cursor pagination.

**Already Done:** Queries run concurrently via `prisma.$transaction()`, but still two DB round-trips.

---

## Security Considerations

### Password Hashing
- **Algorithm:** bcrypt with 8 salt rounds
- **Salt Rounds:** 8 for salt generation, 10 for hashing (implicit in bcrypt library)
- **Key Method:** `UserUseCase.hashPassword()`
- **Consistency:** All flows (register, password reset, password change) use same method → DRY + security

### JWT Tokens
- **Secret:** Stored in `config.rpc.jwtSecret` (from `.env.rpc.jwtSecret`)
- **Expiry:** 7 days
- **Validation:** Checked against live DB user (ensures deleted/banned users can't keep using old tokens)
- **Generation:** `jwtProvider.generateToken({ sub: userId, role })`

### Password Reset Security
- **Token Generation:** `crypto.randomBytes(32).toString('hex')` → 256 bits entropy
- **Token Expiration:** 1 hour
- **One-Time Use:** Tokens marked as used after password reset
- **User Enumeration Prevention:** Always returns generic "check your email" message, whether user exists or not

### Role-Based Access Control
- **Middleware:** `mdlFactory.allowRoles([UserRole.ADMIN])`
- **Admin Endpoints:** POST /users, PATCH /users/:id, DELETE /users/:id
- **User Status Checks:** Inactive/banned/deleted users cannot login or access protected endpoints

### Data Stripping
- **Sensitive Fields:** `password` and `salt` stripped from all API responses
- **Implementation:** `const { password, salt, ...otherProps } = user; return otherProps;`

---

## Testing Recommendations

### Unit Tests
- `UserUseCase` methods with mocked repository
- `PasswordResetUsecase` with mocked email service and repository
- `requireActiveUser()` type guard

### Integration Tests
- Registration + Login flow
- Password reset request + reset
- Token introspection
- Redis event consumption (counter updates)

### End-to-End Tests (Postman/API)
- Register new user → verify can login
- Login → verify JWT token works
- Update profile → verify changes persist
- Get user stats → verify aggregations
- Admin create/delete user → verify role checks

---

## Architecture Patterns Used

| Pattern | Implementation | Purpose |
|---------|----------------|---------|
| **Clean Architecture** | Model → Interface → UseCase → Infrastructure | Layered separation of concerns |
| **CQRS** | QueryRepository + CommandRepository | Separate read/write concerns |
| **Repository Pattern** | `IRepository<Entity, DTO, Cond>` | Abstraction for data access |
| **Dependency Injection** | TSyringe + manual wiring in module.ts | Loose coupling, testability |
| **Value Object** | Zod schemas (userSchema, userLoginDTOSchema, etc.) | Type-safe DTOs |
| **Event-Driven** | Redis pub/sub + RedisUserConsumer | Decoupled counter updates |
| **Type Guard** | `requireActiveUser(): asserts user is User` | Runtime + compile-time safety |
| **Error Translation** | Prisma P2002/P2025 → AppError | Domain-safe exceptions |

---

## References

- **Prisma Schema:** `bento-microservices-express/prisma/schema.prisma`
- **Shared Utilities:** `bento-microservices-express/src/shared/`
- **Postman Collections:** (repo root)
- **Frontend API Client:** `bento-social-next/src/apis/user.ts`

