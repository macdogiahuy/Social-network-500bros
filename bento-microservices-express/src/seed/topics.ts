import { v7 as uuidv7 } from 'uuid';
import prisma from '../shared/components/prisma';

const defaultTopics = [
  {
    name: 'General',
    color: '#4287f5'
  },
  {
    name: 'Technology',
    color: '#42f5a4'
  },
  {
    name: 'News',
    color: '#f54242'
  },
  {
    name: 'Entertainment',
    color: '#f5d442'
  },
  {
    name: 'Sports',
    color: '#42f5d4'
  }
];

async function seedTopics() {
  try {
    console.log('🌱 Seeding topics...');

    for (const topic of defaultTopics) {
      const existingTopic = await prisma.topics.findFirst({
        where: { name: topic.name }
      });

      if (!existingTopic) {
        await prisma.topics.create({
          data: {
            id: uuidv7(),
            name: topic.name,
            color: topic.color,
            postCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log(`✅ Created topic: ${topic.name}`);
      } else {
        console.log(`ℹ️ Topic already exists: ${topic.name}`);
      }
    }

    console.log('✅ Topics seeding completed');
  } catch (error) {
    console.error('❌ Error seeding topics:', error);
    throw error;
  }
}

export default seedTopics;
