import mongoose from 'mongoose';
import { config } from './index';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = config.database.uri;
    const maskedUri = mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    
    logger.info('Connecting to MongoDB...');
    logger.debug(`MongoDB URI: ${maskedUri}`);
    
    // Set connection timeout to 10 seconds
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    logger.info('MongoDB connected successfully');
    if (mongoose.connection.db) {
      logger.info(`Database: ${mongoose.connection.db.databaseName}`);
    }
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('MongoDB connection failed');
    logger.error(`Error: ${err.message}`);
    
    if (process.env.NODE_ENV === 'development') {
      logger.info('');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('❌ MONGODB CONNECTION FAILED');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('');
      
      const maskedUri = config.database.uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
      logger.info(`Connection string: ${maskedUri}`);
      logger.info('');
      
      // Provide specific error guidance
      if (err.message.includes('ECONNREFUSED')) {
        logger.info('🔍 Error Type: Connection Refused');
        logger.info('   MongoDB is not running on localhost:27017');
        logger.info('');
        logger.info('📋 SOLUTION - Choose ONE option:');
        logger.info('');
        logger.info('Option 1: Install & Start Local MongoDB (Mac)');
        logger.info('   Run these commands:');
        logger.info('   brew tap mongodb/brew');
        logger.info('   brew install mongodb-community@7.0');
        logger.info('   brew services start mongodb-community@7.0');
        logger.info('');
        logger.info('   Or use the automated script:');
        logger.info('   ./INSTALL_MONGODB.sh');
      } else if (err.message.includes('querySrv') || err.message.includes('ENOTFOUND')) {
        logger.info('🔍 Error Type: DNS/Host Not Found');
        logger.info('   MongoDB Atlas cluster does not exist or DNS failed');
        logger.info('');
        logger.info('📋 SOLUTION:');
        logger.info('   Your MongoDB Atlas connection string is invalid.');
        logger.info('   The cluster may have been deleted or the URL is wrong.');
        logger.info('');
        logger.info('   1. Go to: https://cloud.mongodb.com');
        logger.info('   2. Create a new FREE cluster (takes 2 minutes)');
        logger.info('   3. Get the connection string');
        logger.info('   4. Update MONGODB_URI in backend/.env');
        logger.info('');
        logger.info('   See SETUP_MONGODB_ATLAS.md for detailed instructions');
      } else {
        logger.info('📋 SOLUTION - Choose ONE option:');
        logger.info('');
        logger.info('Option 1: Local MongoDB (Mac)');
        logger.info('   brew tap mongodb/brew');
        logger.info('   brew install mongodb-community@7.0');
        logger.info('   brew services start mongodb-community@7.0');
      }
      
      logger.info('');
      logger.info('Option 2: MongoDB Atlas (Cloud - FREE, 2 minutes)');
      logger.info('   1. Sign up: https://www.mongodb.com/cloud/atlas/register');
      logger.info('   2. Create FREE cluster');
      logger.info('   3. Get connection string');
      logger.info('   4. Update MONGODB_URI in backend/.env');
      logger.info('');
      logger.info('   Detailed guide: See SETUP_MONGODB_ATLAS.md');
      logger.info('');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('');
    }
    
    process.exit(1);
  }
};

