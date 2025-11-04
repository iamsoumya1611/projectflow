const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Use development URI by default, but allow production URI override
    const uri = process.env.NODE_ENV === 'production' ? process.env.MONGO_URI : process.env.DEV_MONGO_URI;
    
    if (!uri) {
      throw new Error('MongoDB connection URI is not defined in environment variables');
    }
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;