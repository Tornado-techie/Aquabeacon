import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import Plant from '../models/Plant.js';

describe('Plants API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/aquabeacon-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Plant.deleteMany({});

    // Create test user and get token
    const userData = {
      firstName: 'Test',
      lastName: 'Owner',
      email: 'owner@example.com',
      password: 'water@1',
      role: 'owner'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = registerResponse.body.accessToken;
    userId = registerResponse.body.user._id;
  });

  describe('GET /api/plants', () => {
    it('should get plants for authenticated user', async () => {
      const response = await request(app)
        .get('/api/plants')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should not allow access without authentication', async () => {
      const response = await request(app)
        .get('/api/plants')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Access token required');
    });
  });

  describe('POST /api/plants', () => {
    it('should create a new plant', async () => {
      const plantData = {
        name: 'Test Water Plant',
        type: 'purification',
        location: {
          address: '123 Test Street, Nairobi',
          county: 'Nairobi'
        },
        capacity: {
          dailyProduction: 5000,
          storageCapacity: 10000
        }
      };

      const response = await request(app)
        .post('/api/plants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(plantData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Plant created successfully');
      expect(response.body.plant.name).toBe(plantData.name);
      expect(response.body.plant.owner).toBe(userId);
    });
  });
});
