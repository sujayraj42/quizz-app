/**
 * MongoDB Configuration & Connection
 * Handles database connection with error handling and pooling
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/study-buddy';

let connection = null;

/**
 * Connect to MongoDB
 * @returns {Promise<mongoose.Connection>}
 */
async function connectDB() {
  if (connection) {
    console.log('✅ Using existing MongoDB connection');
    return connection;
  }

  try {
    console.log('📡 Connecting to MongoDB...');
    console.log('URI:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Hide password

    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 45000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority',
    });

    connection = mongoose.connection;

    connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
    });

    connection.on('disconnected', () => {
      console.log('❌ MongoDB disconnected');
      connection = null;
    });

    connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message);
    });

    return connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    
    // If local MongoDB fails, continue with in-memory mode
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  Running in memory mode (local development)');
      return null;
    }
    
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  if (connection) {
    await mongoose.disconnect();
    connection = null;
    console.log('✅ MongoDB disconnected');
  }
}

/**
 * Check MongoDB connection status
 */
function isConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  disconnectDB,
  isConnected,
  mongoose,
};
