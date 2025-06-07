const mongoose = require('mongoose');
require('dotenv').config();

async function clearDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections`);
    
    if (collections.length === 0) {
      console.log('🎉 Database is already empty!');
      process.exit(0);
    }
    
    // Drop each collection
    for (let collection of collections) {
      await mongoose.connection.db.collection(collection.name).drop();
      console.log(`🗑️  Dropped collection: ${collection.name}`);
    }
    
    console.log('🎉 Database cleared successfully!');
    console.log('🚀 Ready for fresh deployment!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearDatabase(); 