const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app'); // Adjust the path to your Express app
const Session = require('../models/session');
const Response = require('../models/response');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/dbTest', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await Session.deleteMany({});
  await Response.deleteMany({});

  await Session.insertMany([
    { userId: 'user1', state: 'initial', createdAt: new Date() },
    { userId: 'user2', state: 'initial', createdAt: new Date() }
  ]);

  await Response.insertMany([
    { state: 'initial', query: 'kupot gemel', responseMessage: 'Are you interested in retirement funds, disability insurance, or investment tracks?' },
    { state: 'category', query: 'Retirement funds', responseMessage: 'Would you like to know about contribution rates or withdrawal rules?' },
    { state: 'subcategory', query: 'Contribution rates', responseMessage: 'Details on Contribution rates are being processed.' },
    { state: 'subcategory', query: 'Withdrawal rules', responseMessage: 'Details on Withdrawal rules are being processed.' },
    { state: 'initial', query: 'Investment tracks', responseMessage: 'Would you like to know about risk profiles or fund types?' },
    { state: 'category', query: 'Risk profiles', responseMessage: 'Details on Risk profiles are being processed.' },
    { state: 'category', query: 'Fund types', responseMessage: 'Details on Fund types are being processed.' },
    { state: 'completed', query: '', responseMessage: 'Your query is complete. If you have more questions, please start a new session.' }
  ]);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Test the /query endpoint', () => {
  test('should return initial response for "kupot gemel"', async () => {
    const response = await request(app).post('/query').send({
      userId: 'user1',
      query: 'kupot gemel'
    });
    expect(response.status).toBe(200);
    expect(response.body.responseMessage).toBe('Are you interested in retirement funds, disability insurance, or investment tracks?');
  });

  test('should return category response for "Retirement funds"', async () => {
    await Session.updateOne({ userId: 'user1' }, { state: 'category' });

    const response = await request(app).post('/query').send({
      userId: 'user1',
      query: 'Retirement funds'
    });
    expect(response.status).toBe(200);
    expect(response.body.responseMessage).toBe('Would you like to know about contribution rates or withdrawal rules?');
  });

  test('should return subcategory response for "Contribution rates"', async () => {
    await Session.updateOne({ userId: 'user1' }, { state: 'subcategory' });

    const response = await request(app).post('/query').send({
      userId: 'user1',
      query: 'Contribution rates'
    });
    expect(response.status).toBe(200);
    expect(response.body.responseMessage).toBe('Details on Contribution rates are being processed.');
  });

  test('should return initial response for "Investment tracks"', async () => {
    const response = await request(app).post('/query').send({
      userId: 'user2',
      query: 'Investment tracks'
    });
    expect(response.status).toBe(200);
    expect(response.body.responseMessage).toBe('Would you like to know about risk profiles or fund types?');
  });

  test('should return category response for "Risk profiles"', async () => {
    await Session.updateOne({ userId: 'user2' }, { state: 'category' });

    const response = await request(app).post('/query').send({
      userId: 'user2',
      query: 'Risk profiles'
    });
    expect(response.status).toBe(200);
    expect(response.body.responseMessage).toBe('Details on Risk profiles are being processed.');
  });

  test('should return category response for "Fund types"', async () => {
    await Session.updateOne({ userId: 'user2' }, { state: 'category' });

    const response = await request(app).post('/query').send({
      userId: 'user2',
      query: 'Fund types'
    });
    expect(response.status).toBe(200);
    expect(response.body.responseMessage).toBe('Details on Fund types are being processed.');
  });
});
