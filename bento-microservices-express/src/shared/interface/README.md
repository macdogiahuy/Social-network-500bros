# Shared Interfaces (`src/shared/interface`)

## Purpose
This directory serves as the **Global Registry** for cross-cutting concepts, architectural contracts, and communication bridges across all feature modules in this microservice.

By defining standard interfaces here, we establish:
1. **Dependency Inversion:** Domain modules (e.g., `User`, `Post`) strictly depend on these abstractions rather than each other's concrete logic. This eliminates tight coupling and circular dependencies.
2. **Structural Consistency:** Enforces consistent CQRS Repository Patterns and Use Cases application-wide.
3. **RPC Boundaries:** Exposes contracts (like `IAuthorRpc`) for safe inter-module communication.

## Core Abstractions
- **Use Cases:** `IUseCase` (standardized shape of business operations).
- **Repositories (CQRS):** Separated into `ICommandRepository` (Writes) and `IQueryRepository` (Reads). Combined via `IRepository`.
- **Authentication/Authz:** Enforces standard shapes for `Requester`, `TokenPayload`, and verification providers.
- **Microservice Communication:** Contracts like `IPostRpc`, `IAuthorRpc`, `ITopicRPC`.

---

## Targeted Improvements (TODOs)
The following improvements are planned to harden these interfaces for production-grade reliability:

- [x] **Type Safety (COMPLETED):** Refactored `ICommandRepository.delete(data: any)` to strictly use `delete(id: string)` and introduced an optional `deleteByCond` method with strict Generic typing (`Cond`).
- [ ] **Transaction Support:** Introduce an `IUnitOfWork` or `ITransaction` context. Repositories must be able to execute within atomic database transactions (crucial for complex Prisma database flows).
- [ ] **Domain Events:** Add an `IEventHandler<Event>` interface to standardise listener implementations matching the existing `IEventPublisher`.
- [ ] **Custom Errors:** Create a shared error interface (e.g., `IAppError`) standardizing response payloads (HTTP Status Codes, Messages, Error Codes) rather than relying on raw JavaScript `Error` throws.
