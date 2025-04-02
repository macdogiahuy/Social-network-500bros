-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: social_network
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('10884e4e-cc80-4022-a841-f574476bab07','26e8957765ef9adc598ab23d5e54a8e22210d5ebff2915eb7eeccfb7ef1c20a9','2025-03-14 01:37:04.739','20241030092854_actor_id_to_notification',NULL,NULL,'2025-03-14 01:37:04.643',1),('841cf59c-0f24-4f5a-a447-5da13a5c0f07','637b85faf0d97abb0df3b6b1282c08685e77c431ee6d2c21b3fc8ca838fdf567','2025-03-14 01:37:04.296','0_init',NULL,NULL,'2025-03-14 01:37:03.513',1),('c6858086-f623-4fd5-a2c6-f212440f9c0f','22f46b9d6c9963c06d695c24a83d54755026027b67bfc25b3ac9514e1021567a','2025-03-14 01:37:04.637','20241030045124_add_color_to_topic',NULL,NULL,'2025-03-14 01:37:04.558',1),('eb04033a-1e9f-47f2-aa5b-4ffb9665d88b','1be171a76db17dc8cc807a3dd0690b53e60eee49703457a407c2563b2eaa6733','2025-03-14 01:37:04.550','20241027110533_refactor',NULL,NULL,'2025-03-14 01:37:04.306',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `sender_id` (`sender_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_rooms`
--

DROP TABLE IF EXISTS `chat_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_rooms` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('direct','group') COLLATE utf8mb4_unicode_ci DEFAULT 'direct',
  `status` enum('pending','active','deleted') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `receiver_id` (`receiver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_rooms`
--

LOCK TABLES `chat_rooms` WRITE;
/*!40000 ALTER TABLE `chat_rooms` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment_likes`
--

DROP TABLE IF EXISTS `comment_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment_likes` (
  `comment_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`comment_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment_likes`
--

LOCK TABLES `comment_likes` WRITE;
/*!40000 ALTER TABLE `comment_likes` DISABLE KEYS */;
INSERT INTO `comment_likes` VALUES ('019594f9-95ee-7446-9fe6-e09eb74b90aa','01959252-e84d-7aab-a0f1-ff8933ca04e9','2025-03-30 07:44:58.150000'),('0195e052-2640-7776-a41d-97b510682c48','01959252-e84d-7aab-a0f1-ff8933ca04e9','2025-03-30 07:44:59.905000'),('0195e158-0c97-7661-ab09-6166a0d70eb9','01959252-e84d-7aab-a0f1-ff8933ca04e9','2025-03-29 10:00:35.557000');
/*!40000 ALTER TABLE `comment_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `liked_count` int NOT NULL DEFAULT '0',
  `reply_count` int NOT NULL DEFAULT '0',
  `status` enum('pending','approved','rejected','deleted','spam') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  KEY `post_id` (`post_id`),
  KEY `status` (`status`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES ('0195d637-453c-7aa3-bb5a-3daf8edcf4fa','01959424-8a00-744f-b562-8f4a992cb785','019594e3-8a84-7117-9e11-7d73fe5caa08','019594f9-95ee-7446-9fe6-e09eb74b90aa','Tui đi với ạ',0,0,'approved','2025-03-27 06:08:21.308000','2025-03-27 06:08:21.308000'),('0195e052-2640-7776-a41d-97b510682c48','0195e051-1392-7776-a41d-67761c5cb5b2','019594e3-8a84-7117-9e11-7d73fe5caa08',NULL,'bảo Long bao đi b êi',1,0,'approved','2025-03-29 05:13:55.008000','2025-03-29 05:13:55.008000'),('0195e053-3c8b-7776-a41d-c27bef313c66','01959252-e84d-7aab-a0f1-ff8933ca04e9','0195e052-b592-7776-a41d-a0f55ffd3ec2',NULL,'Long say gex =)))',0,0,'approved','2025-03-29 05:15:06.251000','2025-03-29 05:15:06.251000'),('0195e158-0c97-7661-ab09-6166a0d70eb9','01959424-8a00-744f-b562-8f4a992cb785','019594e3-8a84-7117-9e11-7d73fe5caa08',NULL,'Cho em đi với 🥰',1,0,'approved','2025-03-29 09:59:58.871000','2025-03-29 09:59:58.871000'),('0195e626-ff83-7990-bceb-d8aecd627cd4','01959252-e84d-7aab-a0f1-ff8933ca04e9','019594e3-8a84-7117-9e11-7d73fe5caa08','0195e158-0c97-7661-ab09-6166a0d70eb9','đi thoai lét gô',0,0,'approved','2025-03-30 08:24:30.339000','2025-03-30 08:24:30.339000'),('0195f4c1-6d50-7000-941b-94531988b578','0195f4bf-e8fc-7000-941b-6a23fded97ba','019594e3-8a84-7117-9e11-7d73fe5caa08',NULL,'hi',0,0,'approved','2025-04-02 04:27:52.016000','2025-04-02 04:27:52.016000'),('0195f4c3-d26d-7000-941b-b5f85147efa0','01959252-e84d-7aab-a0f1-ff8933ca04e9','0195f4c0-dc82-7000-941b-71f4ad3df163',NULL,'xời, bình thường',0,0,'approved','2025-04-02 04:30:28.973000','2025-04-02 04:30:28.973000');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `followers`
--

DROP TABLE IF EXISTS `followers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `followers` (
  `follower_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `following_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`following_id`,`follower_id`),
  KEY `follower_id` (`follower_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `followers`
--

LOCK TABLES `followers` WRITE;
/*!40000 ALTER TABLE `followers` DISABLE KEYS */;
INSERT INTO `followers` VALUES ('01959424-8a00-744f-b562-8f4a992cb785','01959252-e84d-7aab-a0f1-ff8933ca04e9','2025-03-14 10:15:26.034000'),('01959252-e84d-7aab-a0f1-ff8933ca04e9','01959424-8a00-744f-b562-8f4a992cb785','2025-03-14 13:19:53.711000'),('01959252-e84d-7aab-a0f1-ff8933ca04e9','0195f4bf-e8fc-7000-941b-6a23fded97ba','2025-04-02 05:18:33.602000');
/*!40000 ALTER TABLE `followers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `action` enum('liked','followed','replied') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_sent` tinyint(1) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actor_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `receiver_id` (`receiver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES ('01959424-c6e4-744f-b562-9ad9959c9313','01959252-e84d-7aab-a0f1-ff8933ca04e9','Anh Tue liked your post','liked',0,1,'2025-03-14 10:13:13','2025-03-14 10:13:13','01959424-8a00-744f-b562-8f4a992cb785'),('01959426-ce8b-744f-b562-aefc80a338a0','01959252-e84d-7aab-a0f1-ff8933ca04e9','Anh Tue followed you','followed',0,1,'2025-03-14 10:15:26','2025-03-14 10:15:26','01959424-8a00-744f-b562-8f4a992cb785'),('019594cf-afad-7ffe-baea-85060e6d10c5','01959424-8a00-744f-b562-8f4a992cb785','Huy Mạc followed you','followed',0,1,'2025-03-14 13:19:54','2025-03-14 13:19:54','01959252-e84d-7aab-a0f1-ff8933ca04e9'),('019594e5-088a-7117-9e11-91b61466b036','01959252-e84d-7aab-a0f1-ff8933ca04e9','Anh Tue liked your post','liked',0,1,'2025-03-14 13:43:13','2025-03-14 13:43:13','01959424-8a00-744f-b562-8f4a992cb785'),('0195d637-45dc-7aa3-bb5a-49d70c763b68','01959252-e84d-7aab-a0f1-ff8933ca04e9','Anh Tue replied to your comment','replied',0,1,'2025-03-27 06:08:21','2025-03-27 06:08:21','01959424-8a00-744f-b562-8f4a992cb785'),('0195e051-5125-7776-a41d-764584949308','01959252-e84d-7aab-a0f1-ff8933ca04e9','Le Cuong liked your post','liked',0,1,'2025-03-29 05:13:00','2025-03-29 05:13:00','0195e051-1392-7776-a41d-67761c5cb5b2'),('0195e051-b9b1-7776-a41d-8a81ca56edda','01959252-e84d-7aab-a0f1-ff8933ca04e9','Le Cuong liked your post','liked',0,1,'2025-03-29 05:13:27','2025-03-29 05:13:27','0195e051-1392-7776-a41d-67761c5cb5b2'),('0195e053-04cd-7776-a41d-b9d7e639ff68','0195e051-1392-7776-a41d-67761c5cb5b2','Huy Mạc liked your post','liked',0,0,'2025-03-29 05:14:52','2025-03-29 05:14:52','01959252-e84d-7aab-a0f1-ff8933ca04e9'),('0195e158-c0f5-7661-ab09-8ef27360a3f6','01959424-8a00-744f-b562-8f4a992cb785','Huy Mạc replied to your comment','replied',0,0,'2025-03-29 10:00:45','2025-03-29 10:00:45','01959252-e84d-7aab-a0f1-ff8933ca04e9'),('0195e159-4554-7661-ab09-a68b89c62e5a','01959424-8a00-744f-b562-8f4a992cb785','Huy Mạc replied to your comment','replied',0,0,'2025-03-29 10:01:19','2025-03-29 10:01:19','01959252-e84d-7aab-a0f1-ff8933ca04e9'),('0195e159-eb52-7661-ab09-bc100ff39bc3','01959424-8a00-744f-b562-8f4a992cb785','Huy Mạc replied to your comment','replied',0,0,'2025-03-29 10:02:01','2025-03-29 10:02:01','01959252-e84d-7aab-a0f1-ff8933ca04e9'),('0195e15f-787e-7661-ab09-d337ce3157d8','01959424-8a00-744f-b562-8f4a992cb785','Huy Mạc replied to your comment','replied',0,0,'2025-03-29 10:08:05','2025-03-29 10:08:05','01959252-e84d-7aab-a0f1-ff8933ca04e9'),('0195e17b-5b1e-733d-8d05-0b7ee28ebfac','01959424-8a00-744f-b562-8f4a992cb785','Huy Mạc replied to your comment','replied',0,0,'2025-03-29 10:38:33','2025-03-29 10:38:33','01959252-e84d-7aab-a0f1-ff8933ca04e9'),('0195e180-56ea-733d-8d05-4038c9531f21','01959424-8a00-744f-b562-8f4a992cb785','Huy Mạc replied to your comment','replied',0,0,'2025-03-29 10:43:59','2025-03-29 10:43:59','01959252-e84d-7aab-a0f1-ff8933ca04e9'),('0195e186-17db-711f-a367-0ca4863f9b3e','01959424-8a00-744f-b562-8f4a992cb785','Huy Mạc replied to your comment','replied',0,0,'2025-03-29 10:50:16','2025-03-29 10:50:16','01959252-e84d-7aab-a0f1-ff8933ca04e9'),('0195e61d-49c6-7bb8-bda1-842ac318c94b','01959424-8a00-744f-b562-8f4a992cb785','Huy Mạc replied to your comment','replied',0,0,'2025-03-30 08:13:54','2025-03-30 08:13:54','01959252-e84d-7aab-a0f1-ff8933ca04e9'),('0195e627-0002-7990-bceb-ed1731221fd4','01959424-8a00-744f-b562-8f4a992cb785','Huy Mạc replied to your comment','replied',0,0,'2025-03-30 08:24:30','2025-03-30 08:24:30','01959252-e84d-7aab-a0f1-ff8933ca04e9'),('0195e62c-4d6d-7990-bcec-0b11eb5d9470','01959424-8a00-744f-b562-8f4a992cb785','Huy Mạc replied to your comment','replied',0,0,'2025-03-30 08:30:18','2025-03-30 08:30:18','01959252-e84d-7aab-a0f1-ff8933ca04e9'),('0195e62e-d9a5-7990-bcec-2c17501a6a5d','01959424-8a00-744f-b562-8f4a992cb785','Huy Mạc replied to your comment','replied',0,0,'2025-03-30 08:33:05','2025-03-30 08:33:05','01959252-e84d-7aab-a0f1-ff8933ca04e9'),('0195e633-5e2a-7990-bcec-46ef7bc2c4a6','01959424-8a00-744f-b562-8f4a992cb785','Huy Mạc replied to your comment','replied',0,0,'2025-03-30 08:38:01','2025-03-30 08:38:01','01959252-e84d-7aab-a0f1-ff8933ca04e9'),('0195f4c1-4eac-7000-941b-8cd7e2a7598f','0195e051-1392-7776-a41d-67761c5cb5b2','Dinh Dat liked your post','liked',0,0,'2025-04-02 04:27:44','2025-04-02 04:27:44','0195f4bf-e8fc-7000-941b-6a23fded97ba'),('0195f4c3-a118-7000-941b-a8d65d5f2ab5','0195f4bf-e8fc-7000-941b-6a23fded97ba','Huy Mạc liked your post','liked',0,0,'2025-04-02 04:30:16','2025-04-02 04:30:16','01959252-e84d-7aab-a0f1-ff8933ca04e9'),('0195f4ef-d6ca-7000-941b-cc3ec74420b1','0195f4bf-e8fc-7000-941b-6a23fded97ba','Huy Mạc followed you','followed',0,0,'2025-04-02 05:18:34','2025-04-02 05:18:34','01959252-e84d-7aab-a0f1-ff8933ca04e9');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_likes`
--

DROP TABLE IF EXISTS `post_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_likes` (
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`post_id`,`user_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_likes`
--

LOCK TABLES `post_likes` WRITE;
/*!40000 ALTER TABLE `post_likes` DISABLE KEYS */;
INSERT INTO `post_likes` VALUES ('01959418-9b72-7994-b9dc-bd8b90359c59','01959424-8a00-744f-b562-8f4a992cb785','2025-03-14 10:13:13.002000'),('019594e3-8a84-7117-9e11-7d73fe5caa08','01959252-e84d-7aab-a0f1-ff8933ca04e9','2025-03-30 07:40:18.914000'),('019594e3-8a84-7117-9e11-7d73fe5caa08','01959424-8a00-744f-b562-8f4a992cb785','2025-03-14 13:43:12.538000'),('019594e3-8a84-7117-9e11-7d73fe5caa08','0195e051-1392-7776-a41d-67761c5cb5b2','2025-03-29 05:13:27.196000'),('0195e052-b592-7776-a41d-a0f55ffd3ec2','01959252-e84d-7aab-a0f1-ff8933ca04e9','2025-03-29 05:14:51.954000'),('0195e052-b592-7776-a41d-a0f55ffd3ec2','0195f4bf-e8fc-7000-941b-6a23fded97ba','2025-04-02 04:27:44.129000'),('0195f4c0-dc82-7000-941b-71f4ad3df163','01959252-e84d-7aab-a0f1-ff8933ca04e9','2025-04-02 04:30:16.312000');
/*!40000 ALTER TABLE `post_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_saves`
--

DROP TABLE IF EXISTS `post_saves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_saves` (
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`post_id`,`user_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_saves`
--

LOCK TABLES `post_saves` WRITE;
/*!40000 ALTER TABLE `post_saves` DISABLE KEYS */;
/*!40000 ALTER TABLE `post_saves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_tags`
--

DROP TABLE IF EXISTS `post_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_tags` (
  `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`post_id`,`tag_id`),
  KEY `tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_tags`
--

LOCK TABLES `post_tags` WRITE;
/*!40000 ALTER TABLE `post_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `post_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `topic_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_featured` tinyint(1) DEFAULT '0',
  `comment_count` int unsigned DEFAULT '0',
  `liked_count` int unsigned DEFAULT '0',
  `type` enum('text','media') COLLATE utf8mb4_unicode_ci DEFAULT 'text',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  KEY `is_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES ('019594e3-8a84-7117-9e11-7d73fe5caa08','Ở Đà Nẵng đi chơi đâu vui vậy mn ơi, giải cứu toai với =)))','','01959252-e84d-7aab-a0f1-ff8933ca04e9','01959361-b1af-7775-8dd8-907f790e53e6',0,6,3,'text','2025-03-14 13:41:35','2025-03-14 13:41:35'),('0195e052-b592-7776-a41d-a0f55ffd3ec2','Long gay','','0195e051-1392-7776-a41d-67761c5cb5b2','01959361-b194-7775-8dd8-8325db74960e',0,1,2,'text','2025-03-29 05:14:32','2025-03-29 05:14:32'),('0195f4c0-dc82-7000-941b-71f4ad3df163','đù má xịn vãi','','0195f4bf-e8fc-7000-941b-6a23fded97ba','01959361-b1a2-7775-8dd8-885f28823e8e',0,1,1,'text','2025-04-02 04:27:15','2025-04-02 04:27:15');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stories`
--

DROP TABLE IF EXISTS `stories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stories` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `like_count` int unsigned NOT NULL DEFAULT '0',
  `view_count` int unsigned NOT NULL DEFAULT '0',
  `media` json DEFAULT NULL,
  `expires_at` timestamp(6) NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp(6) NOT NULL,
  `updated_at` timestamp(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stories_created_at_idx` (`created_at`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stories`
--

LOCK TABLES `stories` WRITE;
/*!40000 ALTER TABLE `stories` DISABLE KEYS */;
/*!40000 ALTER TABLE `stories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `story_likes`
--

DROP TABLE IF EXISTS `story_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `story_likes` (
  `story_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`story_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `story_likes`
--

LOCK TABLES `story_likes` WRITE;
/*!40000 ALTER TABLE `story_likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `story_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `story_views`
--

DROP TABLE IF EXISTS `story_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `story_views` (
  `story_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`story_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `story_views`
--

LOCK TABLES `story_views` WRITE;
/*!40000 ALTER TABLE `story_views` DISABLE KEYS */;
/*!40000 ALTER TABLE `story_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_count` int unsigned DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `topics`
--

DROP TABLE IF EXISTS `topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topics` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_count` int unsigned DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `color` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topics`
--

LOCK TABLES `topics` WRITE;
/*!40000 ALTER TABLE `topics` DISABLE KEYS */;
INSERT INTO `topics` VALUES ('01959361-b0ee-7775-8dd8-6c9720eacb75','Technology',0,'2025-03-14 06:40:08','2025-03-14 06:40:08','#007BFF'),('01959361-b164-7775-8dd8-70105dc71a7e','Sports',0,'2025-03-14 06:40:08','2025-03-14 06:40:08','#28A745'),('01959361-b17d-7775-8dd8-7a01e3944b5b','News',0,'2025-03-14 06:40:08','2025-03-14 06:40:08','#DC3545'),('01959361-b194-7775-8dd8-8325db74960e','Entertainment',1,'2025-03-14 06:40:08','2025-03-14 06:40:08','#FFC107'),('01959361-b1a2-7775-8dd8-885f28823e8e','Food',1,'2025-03-14 06:40:08','2025-03-14 06:40:08','#6F42C1'),('01959361-b1af-7775-8dd8-907f790e53e6','Travel',1,'2025-03-14 06:40:08','2025-03-14 06:40:08','#17A2B8'),('01959361-b1be-7775-8dd8-9ac954ce6706','Fashion',0,'2025-03-14 06:40:08','2025-03-14 06:40:08','#FD7E14'),('01959361-b1c9-7775-8dd8-a7d92deed34d','Health',0,'2025-03-14 06:40:08','2025-03-14 06:40:08','#20C997'),('01959361-b1d5-7775-8dd8-a8fe9200098c','Science',0,'2025-03-14 06:40:08','2025-03-14 06:40:08','#6C757D'),('01959361-b1e5-7775-8dd8-b0391ac9b45b','Art',0,'2025-03-14 06:40:08','2025-03-14 06:40:08','#E83E8C');
/*!40000 ALTER TABLE `topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cover` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `salt` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `bio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `follower_count` int unsigned DEFAULT '0',
  `post_count` int unsigned DEFAULT '0',
  `status` enum('active','pending','inactive','banned','deleted') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `role` (`role`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('01959252-e84d-7aab-a0f1-ff8933ca04e9',NULL,'http://localhost:3000/uploads/64309000000_281553601_1200625580678473_5285464895107595026_n.jpg','macdogiahuy','Huy','Mạc','$2b$10$9Yt40ngxeZkdbkMJiy6EdODTi8aSOfI8ssSDpNzDOx/g5bNrpDhUK','$2b$08$9MMYAkKp/7MiAYdlxssgbe','user','Coder at Everfit and Vocal at ButterCup band.','https://www.facebook.com/macdogiahuy',1,1,'active','2025-03-14 01:44:22','2025-03-14 01:44:22'),('01959424-8a00-744f-b562-8f4a992cb785','http://localhost:3000/uploads/70193000000_421010717_2193767097639411_2384527111241633164_n.jpg','http://localhost:3000/uploads/70173000000_432980032_1120682202403227_7511702600044185211_n.jpg','luongtueanh','Thu','Pham','$2b$10$yk3nKoiYA2.SPEF8XOzxjOqNg3GJ7NPa70XxDL1f1EjN8KT46htky','$2b$08$GC236xOUVsm6.tZjReQR2e','user','Hie\'s gf','',1,0,'active','2025-03-14 10:12:57','2025-03-14 10:12:57'),('0195e051-1392-7776-a41d-67761c5cb5b2',NULL,'http://localhost:3000/uploads/105386000000_hetcuu.jpg','lequangbaocuong','Le','Cuong','$2b$10$E1t29c7kFR.19wpmsaEp7uE6NqEJoCvZ38J4b9fRkglR55Tf8P/k.','$2b$08$Hlqu0CEB6cVKAYPf6KxOK.','user',NULL,NULL,0,1,'active','2025-03-29 05:12:45','2025-03-29 05:12:45'),('0195f4bf-e8fc-7000-941b-6a23fded97ba',NULL,'http://localhost:3000/uploads/223228000000_Screenshot 2025-03-16 200354.png','DatDinh','Dinh','Dat','$2b$10$pDiLXUT4C4kifda4Z.Sk7O0k.11I8ILvcdg3zc88nYsaTetHFFy5m','$2b$08$mziiT9sNvsH1o/ouP3ZnNu','user','sai đẹp chiêu\n','',1,1,'active','2025-04-02 04:26:13','2025-04-02 04:26:13');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-02  8:29:35
