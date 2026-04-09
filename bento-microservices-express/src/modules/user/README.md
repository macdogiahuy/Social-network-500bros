# User Module Architecture

The `src/modules/user/` directory follows a **Clean Architecture** (Hexagonal Architecture/Ports and Adapters) pattern. This structure separates business logic from technical details like databases, HTTP frameworks, or message brokers.

## Directory Structure

```
src/modules/user/
├── infras/
│   ├── repository/
│   │   ├── index.ts                 # Prisma-based UserRepository
│   │   ├── reset-token.repository.ts
│   │   └── TODOLIST.md
│   ├── services/
│   │   └── email.service.ts         # Email sending integration
│   └── transport/
│       ├── index.ts                 # UserHTTPService (HTTP handlers)
│       ├── redis-consumer.ts        # Redis pub/sub consumer
│       ├── password-reset-http.service.ts
│       └── user-stats-http.service.ts
├── interface/
│   └── index.ts                     # IUserUseCase, IPasswordResetUsecase, IUserStatsUsecase
├── model/
│   ├── index.ts                     # User entity, enums, Zod schemas
│   ├── error.ts                    # Domain errors
│   └── reset-password.ts           # Password reset data structures
├── usecase/
│   ├── index.ts                    # UserUseCase implementation
│   ├── password-reset.usecase.ts
│   └── user-stats.usecase.ts
└── module.ts                       # Router & DI wiring (Express routes)
```

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    USER MODULE                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  INTERFACE LAYER  │  USECASE LAYER  │  INFRASTRUCTURE LAYER                    │
│  (Contracts)      │  (Business Logic)│  (Repository/Services/Transport)       │
├───────────────────┼──────────────────┼────────────────────────────────────────┤
│ IUserUseCase      │  UserUseCase     │  - PrismaUserRepository                │
│ IPasswordReset    │  PasswordReset   │  - PrismaUserQueryRepository          │
│ IUserStatsUsecase │    Usecase       │  - PrismaUserCommandRepository         │
│ IUserCommandRepo  │  UserStats       │  - PrismaResetTokenRepository          │
│                   │    Usecase       │  - EmailService                         │
│                   │                  │  - UserHTTPService                     │
└───────────────────┴──────────────────┴────────────────────────────────────────┘
```

---

## 1. Model Layer (`model/`)

Core domain entities and validation schemas using Zod.

- **`index.ts`**: User entity with Zod schemas for validation
  - Enums: `Gender` (male/female/unknown), `Status` (active/pending/inactive/banned/deleted)
  - Schemas: `userSchema`, `userRegistrationDTOSchema`, `userLoginDTOSchema`, `userUpdateDTOSchema`, `userUpdateProfileDTOSchema`, `userCondDTOSchema`
  - Types: `User`, `UserRegistrationDTO`, `UserLoginDTO`, `UserUpdateDTO`, `UserUpdateProfileDTO`, `UserCondDTO`

- **`error.ts`**: Domain-specific errors (e.g., `ErrUsernameExisted`, `ErrInvalidUsernameAndPassword`, `ErrUserInactivated`)

- **`reset-password.ts`**: Password reset flow data structures

---

## 2. Interface Layer (`interface/`)

Contracts that define the boundaries between business logic and infrastructure.

### IUserUseCase
Core business operations for user management. Extends `IUseCase` for standard CRUD operations.

**CRUD Operations (from IUseCase):**
- `create(data)` → string (delegate to register)
- `getDetail(id)` → User | null (throws if deleted)
- `list(cond, paging)` → Paginated<User>
- `update(id, data)` → boolean
- `delete(id)` → boolean

**Domain-Specific Operations:**
- `login(data: UserLoginDTO): Promise<string>` - Authenticate and return JWT
- `register(data: UserRegistrationDTO): Promise<string>` - Create user and return JWT
- `profile(userId: string): Promise<User>` - Get user by ID
- `updateProfile(requester: Requester, data: UserUpdateDTO): Promise<boolean>` - Update user profile
- `verifyToken(token: string): Promise<TokenPayload>` - Validate JWT token
- `listByIds(ids: string[]): Promise<User[]>` - Batch fetch users
- `verifyPassword(plainPassword, storedHash): Promise<boolean>` - Password verification
- `hashPassword(password): Promise<{ hash, salt }>` - Password hashing

### IPasswordResetUsecase
Password reset workflow contract.

- `requestReset(data: RequestResetDTO): Promise<boolean>` - Initiate password reset (find user, generate token, send email)
- `resetPassword(data: ResetPasswordDTO): Promise<boolean>` - Complete password reset (validate token, update password, invalidate tokens)

### IUserStatsUsecase
User statistics retrieval contract.

- `getUserStats(userId: string): Promise<UserStats>` - Get aggregated stats (followers, following, posts, likes)

### IUserCommandRepository
Write operations with atomic counter operations.

- `incrementCount(id, field, step)` - Increment followerCount or postCount
- `decrementCount(id, field, step)` - Decrement followerCount or postCount

---

## 3. UseCase Layer (`usecase/`)

Application business rules and workflow orchestration.

### UserUseCase (`index.ts`)
Main implementation of `IUserUseCase`.

**Key Features:**
- Password hashing with bcrypt + salt (8 rounds)
- JWT token generation via `jwtProvider`
- Status validation for login/delete operations
- CRUD operations: create, getDetail, update, list, delete
- Public methods for password operations (hashPassword, verifyPassword) - shared across modules

**Dependency:**
```typescript
constructor(
  private readonly repository: IRepository<User, UserCondDTO, UserUpdateDTO>
)
```

### PasswordResetUsecase (`password-reset.usecase.ts`)
Implements `IPasswordResetUsecase`.

**Flow:**
1. **requestReset**: Validate email → Find user via `userUseCase.list({ email })` → Generate token → Save to `ResetTokenRepository` → Send email via `EmailService`
2. **resetPassword**: Validate token → Get user via `userUseCase.getDetail()` → Hash password via `userUseCase.hashPassword()` → Update user + invalidate tokens in parallel

**Dependency:**
```typescript
constructor(
  private readonly resetTokenRepo: IResetTokenRepository,
  private readonly emailService: IEmailService,
  private readonly userUseCase: IUserUseCase  // Uses UserUseCase for DRY principle
)
```

**Why use IUserUseCase instead of IRepository?**
- Single source of truth for password operations
- Consistent hashing algorithm across all flows (register, reset, password change)
- Better abstraction - doesn't couple to data layer
- Automatic validation/hooks if added later

### UserStatsUsecase (`user-stats.usecase.ts`)
Implements `IUserStatsUsecase`.

**Key Features:**
- Parallel queries using `Promise.all` for performance
- Aggregates: follower count, following count, post count, total likes

**Dependency:** Uses Prisma directly (for complex aggregation queries)

---

## 4. Infrastructure Layer (`infras/`)

### Repository (`repository/`)

- **`index.ts`**: Prisma-based repository implementation combining:
  - `PrismaUserQueryRepository` - Read operations
  - `PrismaUserCommandRepository` - Write operations + atomic counters
  - `PrismaUserRepository` - Combines both

- **`reset-token.repository.ts`**: Password reset token persistence
  - `createToken()` - Create new token, invalidate existing ones
  - `findByToken()` - Lookup token
  - `markAsUsed()` - Mark token as used
  - `invalidateUserTokens()` - Invalidate all tokens for a user

### Services (`services/`)

- **`email.service.ts`**: Email sending integration (IEmailService interface)

### Transport (`transport/`)

- **`index.ts`**: UserHTTPService - HTTP handlers (register, login, profile, update, CRUD)
- **`redis-consumer.ts`**: Redis pub/sub consumer for async events
- **`password-reset-http.service.ts`**: HTTP handlers for password reset endpoints
- **`user-stats-http.service.ts`**: HTTP handler for user stats endpoint

---

## 5. Entry Points

- **`module.ts`**: Defines Express router and wires all components together via DI

---

## Data Flow for Password Reset

```
Client → UserHTTPService → PasswordResetUsecase
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            UserUseCase    ResetTokenRepo   EmailService
                    │              │              │
                    ▼              ▼              ▼
              (hash/list/     (store/       (send email)
               update)        validate)
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/auth/register` | Register new user |
| POST | `/v1/auth/login` | Login user |
| GET | `/v1/users/profile` | Get current user profile |
| PUT | `/v1/users/profile` | Update user profile |
| POST | `/v1/users/forgot-password` | Request password reset |
| POST | `/v1/users/reset-password` | Reset password with token |
| GET | `/v1/users/:userId/stats` | Get user statistics |
| GET | `/v1/users/:id` | Get user by ID |
| DELETE | `/v1/users/:id` | Delete user (soft delete) |

---

## Security Features

- Passwords hashed with bcrypt + salt (8 rounds)
- JWT-based authentication
- Role-based access control via `UserRole` enum
- Status validation (prevents login for inactive/deleted/banned users)
- Zod schema validation for all DTOs
- Token expiration (1 hour for password reset)
- Token invalidation on password change

---

## Scalability

This architecture allows you to:
- Swap Prisma for raw SQL without touching business logic
- Replace Express with Fastify while keeping use cases unchanged
- Add new transport layers (gRPC, WebSocket) via the interface pattern

---

## DRY Principle

Password operations are centralized in `UserUseCase`:
- `hashPassword()` - Used by register, password reset, password change
- `verifyPassword()` - Used by login

Other use cases (`PasswordResetUsecase`) inject `IUserUseCase` instead of directly using bcrypt, ensuring consistent behavior across all password operations.