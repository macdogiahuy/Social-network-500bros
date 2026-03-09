import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up orphaned data...');

  // Find orphaned post likes
  const orphanedLikes = await prisma.$queryRaw`
    SELECT pl.post_id, pl.user_id 
    FROM post_likes pl 
    LEFT JOIN posts p ON pl.post_id = p.id 
    WHERE p.id IS NULL
  `;
  console.log('Orphaned likes:', orphanedLikes);

  // Delete orphaned post likes
  await prisma.$executeRaw`
    DELETE pl 
    FROM post_likes pl 
    LEFT JOIN posts p ON pl.post_id = p.id 
    WHERE p.id IS NULL
  `;

  console.log('Cleanup complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
