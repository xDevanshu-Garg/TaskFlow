const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database for seeding');

    const existing = await User.findOne({ email: 'admin@avidus.com' });
    if (existing) {
      console.log('Admin user already exists, skipping seed');
    } else {
      await User.create({
        name: 'Admin',
        email: 'admin@avidus.com',
        password: 'admin123',
        role: 'Admin',
      });
      console.log('Admin user created successfully');
    }
  } catch (err) {
    console.error(`Seed failed: ${err.message}`);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected');
  }
};

seedAdmin();
