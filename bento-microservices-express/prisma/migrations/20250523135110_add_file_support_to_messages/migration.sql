/*
  Warnings:

  - You are about to drop the column `bio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `cover` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `follower_count` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `post_count` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `salt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `website_url` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `username` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.
  - You are about to alter the column `first_name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.
  - You are about to alter the column `last_name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `status` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_conversation_id_fkey`;

-- DropIndex
DROP INDEX `role` ON `users`;

-- DropIndex
DROP INDEX `status` ON `users`;

-- AlterTable
ALTER TABLE `messages` ADD COLUMN `file_name` VARCHAR(255) NULL,
    ADD COLUMN `file_size` INTEGER NULL,
    ADD COLUMN `file_type` VARCHAR(100) NULL,
    ADD COLUMN `file_url` VARCHAR(1000) NULL,
    MODIFY `content` TEXT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `bio`,
    DROP COLUMN `cover`,
    DROP COLUMN `follower_count`,
    DROP COLUMN `post_count`,
    DROP COLUMN `salt`,
    DROP COLUMN `website_url`,
    ADD COLUMN `email` VARCHAR(100) NOT NULL,
    MODIFY `username` VARCHAR(50) NOT NULL,
    MODIFY `first_name` VARCHAR(50) NULL,
    MODIFY `last_name` VARCHAR(50) NULL,
    MODIFY `password` VARCHAR(255) NOT NULL,
    MODIFY `status` ENUM('active', 'pending', 'inactive', 'banned', 'deleted') NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);

-- CreateIndex
CREATE UNIQUE INDEX `users_email_key` ON `users`(`email`);

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_likes` ADD CONSTRAINT `post_likes_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `messages` RENAME INDEX `messages_conversation_id_idx` TO `conversation_id`;

-- RenameIndex
ALTER TABLE `messages` RENAME INDEX `messages_sender_id_idx` TO `sender_id`;
