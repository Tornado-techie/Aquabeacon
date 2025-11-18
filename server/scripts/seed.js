import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Standard from '../models/Standard.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aquabeacon';

const standards = [
  {
    code: 'KS EAS 153',
    name: 'Drinking water — Specification',
    description: 'Kenya Standard for drinking water quality requirements',
    category: 'water_quality',
    parameters: [
      { name: 'pH', unit: '-', minValue: 6.5, maxValue: 8.5, testMethod: 'KS 05-459' },
      { name: 'Turbidity', unit: 'NTU', minValue: null, maxValue: 5, testMethod: 'KS 05-459' },
      { name: 'Total Coliform', unit: 'cfu/100ml', minValue: null, maxValue: 0, testMethod: 'KS 05-459' },
      { name: 'E. coli', unit: 'cfu/100ml', minValue: null, maxValue: 0, testMethod: 'KS 05-459' },
      { name: 'Total Dissolved Solids', unit: 'mg/l', minValue: null, maxValue: 1000, testMethod: 'KS 05-459' }
    ],
    effectiveDate: new Date('2020-01-01'),
    isActive: true
  },
  {
    code: 'KS EAS 13',
    name: 'Labelling of pre-packaged foods',
    description: 'General standard for the labelling of pre-packaged foods',
    category: 'labeling',
    parameters: [],
    effectiveDate: new Date('2018-01-01'),
    isActive: true
  },
  {
    code: 'KS EAS 38',
    name: 'Bottled drinking water — Specification',
    description: 'Requirements for bottled drinking water',
    category: 'water_quality',
    parameters: [
      { name: 'Fluoride', unit: 'mg/l', minValue: null, maxValue: 1.5, testMethod: 'KS 05-459' },
      { name: 'Arsenic', unit: 'mg/l', minValue: null, maxValue: 0.01, testMethod: 'KS 05-459' },
      { name: 'Lead', unit: 'mg/l', minValue: null, maxValue: 0.01, testMethod: 'KS 05-459' }
    ],
    effectiveDate: new Date('2019-01-01'),
    isActive: true
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing standards
    await Standard.deleteMany({});
    console.log('Cleared existing standards');

    // Insert new standards
    await Standard.insertMany(standards);
    console.log('Added standards data');

    // Create demo users if they don't exist
    const demoUsers = [
      {
        email: 'admin@test.com',
        password: 'water@1',
        role: 'admin',
        firstName: 'Demo',
        lastName: 'Admin',
        phone: '+254700000001'
      },
      {
        email: 'owner@test.com',
        password: 'water@1',
        role: 'owner',
        firstName: 'Demo',
        lastName: 'Owner',
        phone: '+254700000002'
      },
      {
        email: 'inspector@test.com',
        password: 'water@1',
        role: 'inspector',
        firstName: 'Demo',
        lastName: 'Inspector',
        phone: '+254700000003'
      },
      {
        email: 'admin@aquabeacon.com',
        password: 'water@1',
        role: 'admin',
        firstName: 'System',
        lastName: 'Admin',
        phone: '+254700000000'
      }
    ];

    for (const userData of demoUsers) {
      const userExists = await User.findOne({ email: userData.email });
      if (!userExists) {
        const user = new User(userData);
        await user.save();
        console.log(`Created ${userData.role} user: ${userData.email} / water@1`);
      } else {
        // Update password for existing users
        userExists.password = 'water@1';
        await userExists.save();
        console.log(`Updated password for existing user: ${userData.email} / water@1`);
      }
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
