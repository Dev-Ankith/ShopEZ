import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer = null;

export const connectDB = async () => {
  try {
    let dbUri = process.env.MONGODB_URI;

    if (!dbUri) {
      console.log('No MONGODB_URI environment variable detected.');
      console.log('Initializing self-contained in-memory MongoDB server (MongoMemoryServer)...');
      
      // Boot the in-memory server
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'shopez-stocks'
        }
      });
      dbUri = mongoServer.getUri();
      
      console.log('In-memory MongoDB server started successfully.');
    }

    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected successfully to: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error.message}`);
  }
};
