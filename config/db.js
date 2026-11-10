
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    console.log(
      `MongoDB Connected: ${conn.connection.host}`
    );

    return conn;

  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;
