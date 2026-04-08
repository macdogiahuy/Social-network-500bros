# TypeScript Application Refactoring TODOs

Now that the Prisma schema is strictly defined and generated, the Express application repositories must be updated to match the new definitions and resolve logic bugs.

### 1. [x] Regenerate your Prisma Client
- *Completed!* The Prisma client is now strictly typed with your new relations.

### 2. [ ] Refactor Repositories to use `include`
Since we now have proper `@relation` definitions, you can fetch related data in a single database trip using Prisma's `include` rather than writing multiple queries.
- **Targets:**
  - `src/modules/post/infras/repository/mysql/index.ts`
  - `src/modules/comment/infras/repository/mysql/index.ts`
  - `src/modules/chat/infras/repository/mysql/index.ts`
- **Example:**
  ```typescript
  const posts = await prisma.posts.findMany({
    include: { author: true } 
  });
  ```

### 3. [ ] Ensure Atomic Counter Updates with `$transaction`
Currently, counter columns like `commentCount` or `followerCount` are updated by standalone queries using `increment: 1` scattered across your repository logic (e.g., `user/infras/repository/index.ts`).
- **Action:** Wrap the actual item creation and the count increment into a safe `$transaction` block to prevent race conditions or out-of-sync counts if one query fails.
- **Example:**
  ```typescript
  await prisma.$transaction([
    prisma.comments.create({ data: { ... } }),
    prisma.posts.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } })
  ]);
  ```

### 4. [ ] Fix SQL Injection Vulnerability in `$queryRawUnsafe`
Raw SQL interpolation is being used to stitch together a `UNION` query. Injecting raw template literal variables `${id}` directly into SQL strings opens you up to SQL injection.
- **Target:** `src/modules/comment/infras/repository/mysql/index.ts`
- **Action:** Rewrite this using strict Prisma ORM queries. If raw SQL is absolutely unavoidable, switch from `$queryRawUnsafe` to `$queryRaw` together with Prisma tagged template literals (` Prisma.sql \`...\` `) to properly parameterize the SQL logic.

### 5. [ ] Fix Sorting by UUIDs
Because the `Posts` table (`id`) utilizes V4 UUID strings, sorting by ID generates random order rather than chronological sorting.
- **Target:** `src/modules/post/infras/repository/mysql/index.ts`
- **Action:** Change the query logic (from `orderBy: { id: 'desc' }`) to use timestamps instead:
  ```typescript
  orderBy: { createdAt: 'desc' }
  ```

### 6. [ ] Refactor Core Interfaces for Prisma Transactions & Flexibility
The generic interfaces in `src/shared/interface/index.ts` currently lack the ability to support robust Prisma ORM patterns required by this project.
- **Transactions Support:** The `README.md` explicitly calls for wrapping counter updates in `$transaction`, but `ICommandRepository` completely lacks the ability to receive a transactional context. We need to optionally pass `tx?: Prisma.TransactionClient` into operations like `insert`, `update`, and `delete`.
- **Bulk Operations:** `ICommandRepository` misses common DB operations like `insertMany`, `updateMany`, and `deleteMany`.
- **Primary Key Constraint:** Interfaces hardcode `id: string`. If an entity has a numeric ID or a composite key, it breaks. We should introduce an `ID` generic (e.g., `interface IUseCase<..., ID = string>`).
