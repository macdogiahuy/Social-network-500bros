# User Repository Improvements TODO List

This document outlines the planned architectural improvements for the User module's infrastructure repository layer (`src/modules/user/infras/repository/`).

## [ ] 1. Optimize Pagination (Database Waterfall)
* **Issue:** `PrismaUserQueryRepository.list()` currently awaits `prisma.users.count()` and `prisma.users.findMany()` sequentially, effectively doubling network latency.
* **Action:** Combine both Prisma promises into a concurrent transaction using `prisma.$transaction([countPromise, findManyPromise])`.

## [x] 2. Prisma Error Translation
* **Issue:** Repositories currently leak raw Prisma database errors (like `P2002` for Unique Constraint Violation) to the outer layers, which can crash Node instances.
* **Action:** Implement safe `try/catch` wrappers around all Prisma mutations to catch specific error codes and translate them into domain-safe `AppError` exceptions (e.g. mapping to HTTP 409 Conflict).

## [ ] 3. Safe Runtime Type Validation
* **Issue:** Queries forcefully map strings into TypeScript enums via blind casting (`role: data.role as UserRole`). This bypasses runtime safety and crashes if dirty data manually enters the DB.
* **Action:** Parse outbound data against a strict validation schema (e.g. Zod) instead of blindly trusting the `as` cast.

## [ ] 4. Validate Soft Deletion Execution
* **Issue:** `deleteByCond` explicitly returns `true` blindly upon completion, even if 0 rows actually matched the provided conditions for `updateMany`.
* **Action:** Return `true` only if `affectedRows.count > 0` so the `UseCase` logic accurately knows if records were actively touched.
