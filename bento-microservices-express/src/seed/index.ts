import seedTopics from './topics';

async function seed() {
  try {
    console.log('🚀 Starting database seeding...');

    await seedTopics();

    console.log('✨ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seed();
