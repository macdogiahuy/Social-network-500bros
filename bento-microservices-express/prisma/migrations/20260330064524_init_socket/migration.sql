-- DropForeignKey
ALTER TABLE `conversations` DROP FOREIGN KEY `conversations_receiver_id_fkey`;

-- DropForeignKey
ALTER TABLE `conversations` DROP FOREIGN KEY `conversations_sender_id_fkey`;

-- AlterTable
ALTER TABLE `conversations` ADD COLUMN `image` VARCHAR(255) NULL,
    ADD COLUMN `name` VARCHAR(100) NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'DIRECT',
    MODIFY `sender_id` VARCHAR(36) NULL,
    MODIFY `receiver_id` VARCHAR(36) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `website_url` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `conversation_participants` (
    `id` VARCHAR(36) NOT NULL,
    `conversation_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `conversation_participants_user_id_idx`(`user_id`),
    UNIQUE INDEX `conversation_participants_conversation_id_user_id_key`(`conversation_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_reactions` (
    `id` VARCHAR(36) NOT NULL,
    `message_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `emoji` VARCHAR(10) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `message_reactions_message_id_idx`(`message_id`),
    INDEX `message_reactions_user_id_idx`(`user_id`),
    UNIQUE INDEX `message_reactions_message_id_user_id_key`(`message_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_participants` ADD CONSTRAINT `conversation_participants_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_participants` ADD CONSTRAINT `conversation_participants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_reactions` ADD CONSTRAINT `message_reactions_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_reactions` ADD CONSTRAINT `message_reactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
