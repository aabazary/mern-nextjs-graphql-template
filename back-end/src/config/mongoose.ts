import mongoose from 'mongoose';

const connectMongoose = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-template';
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectMongoose; 