require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = 'admin@example.com';
    const password = process.env.ADMIN_INITIAL_PASSWORD;

    if (!password) {
      throw new Error('ADMIN_INITIAL_PASSWORD is missing in .env');
    }

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('Admin email already exists. No changes made.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: 'Administrator',
      email,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin account created successfully.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();