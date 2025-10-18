const { cleanupDatabase } = require('./cleanup-database');
const { seedDatabase } = require('./seed-database');

async function resetAndSeedDatabase() {
  console.log('🚀 Bắt đầu reset và seed database...\n');

  try {
    // Step 1: Cleanup existing data
    console.log('Step 1: Cleanup existing data');
    await cleanupDatabase();
    console.log('✅ Cleanup hoàn thành!\n');

    // Step 2: Seed new data
    console.log('Step 2: Seed new data');
    await seedDatabase();
    console.log('✅ Seed hoàn thành!\n');

    console.log('🎉 Reset và seed database thành công!');
  } catch (error) {
    console.error('❌ Lỗi trong quá trình reset và seed:', error);
    process.exit(1);
  }
}

// Run the reset and seed function
if (require.main === module) {
  resetAndSeedDatabase();
}

module.exports = { resetAndSeedDatabase };
