# 🎓 Exercise: Extending the Database with Prisma

**Goal:** The product team wants to add a "User Badges" system to the social network (e.g., "Top Commenter," "Early Adopter"). Your task is to update the Prisma schema, generate a migration, and push this change into your running Docker MySQL database.

This tutorial provides the requirements and hints, but leaves the exact implementation up to you so you can develop your intuition!

---

## Phase 1: Designing the Blueprint (`schema.prisma`)

**Requirement:** 
You need to create a new model (table) to store Badges. Every badge needs a unique ID, a name, an icon URL, and we need a way to track which users have earned which badges.

**Hints & Ideas to develop your thoughts:**
1. Open `prisma/schema.prisma`.
2. Look at how existing isolated tables like `Topics` or `Tags` are defined. What properties do they share? (Usually an `@id` field, `createdAt`, and `updatedAt`).
3. **Idea:** Define a `Badges` model.
   * `id` (Int or String? Look at how `Tags` does it).
   * `name` (String, should probably be `@unique`).
   * `iconUrl` (String, maybe optional `?` in case a badge doesn't have an image yet).
4. **The Relationship:** How do we link `Users` and `Badges`? 
   * A user can have many badges. A badge can belong to many users. This is a Many-to-Many relationship.
   * *Prisma Magic Hint:* In Prisma, you can simply add `badges Badges[]` to the `Users` model, and `users Users[]` to the `Badges` model. Prisma will automatically handle the mapping table under the hood!

*Stop here and try to write the Prisma model before moving to Phase 2.*

---

## Phase 2: Generating the Migration (The Bridge to Docker)

**Requirement:** 
Right now, your brilliant `Badges` model only exists in text inside `schema.prisma`. The MySQL database inside your Docker container has no idea it exists. We need to create a SQL migration and apply it.

**Hints & Ideas to develop your thoughts:**
1. Remember "Workflow A" from the `DOCKER_ARCHITECTURE.md` file? The command we want uses `migrate dev`.
2. Open your terminal in the `bento-microservices-express` folder.
3. **The Command:** Think about running `pnpm prisma migrate dev --name add_user_badges`.
4. **What to watch for:** 
   * When you press Enter, Prisma connects to `localhost:3306` (your Docker container).
   * Notice that a new folder appears inside the `prisma/` directory called `migrations/`.
   * Open the `.sql` file inside that new folder. *Observe how Prisma translated your TypeScript-like schema syntax into raw `CREATE TABLE` MySQL commands!*

*(Troubleshooting note: If Prisma complains about "drift" or asks to reset the database, it's because this is your very first migration on top of a raw SQL dump. It is safe to accept the reset for local development, or run `pnpm prisma db push` as a quicker alternative to force the changes without tracking migration history).*

---

## Phase 3: Client Generation (Updating Node.js)

**Requirement:** 
The database is updated, but your Express application still doesn't know about `prisma.badges`. We need to update the TypeScript types locally.

**Hints & Ideas to develop your thoughts:**
1. *Normally*, `prisma migrate dev` runs this step automatically for you. 
2. But to manually trigger it and see what happens, use the `generate` command.
3. **The Command:** Run `pnpm prisma generate`.
4. **What to watch for:** Read the terminal output. It tells you exactly where the new TypeScript client was saved (deep inside your `node_modules`). Now, if you open `/src/app.ts` and type `prisma.badges.`, your IDE will instantly autocomplete the methods!

---

## Phase 4: Validation (Prove it works)

**Requirement:** 
Prove to yourself that your new `Badges` table actually exists inside the Docker MySQL container.

**Hints & Ideas to develop your thoughts:**
Choose one (or both!) of these methods to verify your success:

* **Method 1: The Visual Way (Prisma Studio)**
  Run `pnpm prisma studio`. A web browser will open. Can you find the `Badges` tab? Can you click "Add record" and create a "Founding Member" badge?

* **Method 2: The Hacker Way (Docker CLI)**
  Let's ask the container directly. Run this command to execute a query inside the running container:
  ```bash
  docker compose exec mysql mysql -u root -ptintin111 longvo_dev -e "SHOW TABLES;"
  ```
  Look at the printed list. Is `Badges` in there? (You might also see a hidden mapping table Prisma created for the many-to-many relationship, like `_BadgesToUsers`!)

---

### 🎉 Conclusion
If you completed these phases, you just successfully orchestrated a full-stack database expansion: from abstract ORM design, through automated SQL migration, directly into a containerized infrastructure!
