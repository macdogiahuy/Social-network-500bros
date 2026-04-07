import { Router } from 'express';
import prisma from '@shared/components/prisma';
import Logger from '@shared/utils/logger';

const router = Router();

router.post('/migrate/fix-image-urls', async (req, res) => {
  try {
    const { secretKey } = req.body;
    if (secretKey !== process.env.MIGRATION_SECRET_KEY) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const usersUpdated = await prisma.$executeRawUnsafe(`
      UPDATE users 
      SET avatar = NULL 
      WHERE avatar LIKE '%localhost%' 
         OR (avatar IS NOT NULL AND avatar NOT LIKE '%cloudinary%' AND avatar NOT LIKE '%unsplash%' AND avatar NOT LIKE '%pravatar%' AND avatar NOT LIKE 'http%')
    `);

    const postsUpdated = await prisma.$executeRawUnsafe(`
      UPDATE posts 
      SET image = NULL, type = 'text' 
      WHERE image LIKE '%localhost%' 
         OR (image IS NOT NULL AND image != '' AND image NOT LIKE '%cloudinary%' AND image NOT LIKE '%unsplash%' AND image NOT LIKE 'http%')
    `);

    Logger.info(`Migration complete: ${usersUpdated} users, ${postsUpdated} posts fixed`);

    return res.status(200).json({
      message: 'Migration completed successfully',
      usersUpdated,
      postsUpdated
    });
  } catch (error) {
    Logger.error(`Migration failed: ${(error as Error).message}`);
    return res.status(500).json({ error: 'Migration failed' });
  }
});

export default router;
