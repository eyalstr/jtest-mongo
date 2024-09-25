const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app'); // Ensure the correct path to the Express app
const Session = require('../models/session');
const Response = require('../models/response');
require('dotenv').config(); // Load environment variables

// Get MongoDB URI from environment or fall back to production database
const mongoUri = process.env.MONGODB_URI_PROD || 'mongodb://localhost:27017/dbProductionTest';

beforeAll(async () => {
  // Connect to MongoDB (ensure connection to a dedicated test database)
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Populate the Response collection with the required data (sessions are handled dynamically in production)
  await Response.deleteMany({}); // Clear only response data in test, careful with production collections
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
  // Close MongoDB connection after the tests
  await mongoose.connection.close();
});

describe('Production Tests for the /twilio/webhook endpoint', () => {
  // Simulate the first interaction with the Twilio webhook
  test('should return initial response for "kupot gemel"', async () => {
    const twilioMessage = {
      From: 'whatsapp:+972545664886', // Production-like WhatsApp number
      Body: 'kupot gemel'              // User's query
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Are you interested in retirement funds, disability insurance, or investment tracks?</Message></Response>'
    );
  });

  // Simulate a response after the session has progressed to 'category'
  test('should return category response for "Retirement funds"', async () => {
    // Manually update the session state
    await Session.updateOne({ userId: 'whatsapp:+972545664886' }, { state: 'category' });

    const twilioMessage = {
      From: 'whatsapp:+972545664886',
      Body: 'Retirement funds'
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Would you like to know about contribution rates or withdrawal rules?</Message></Response>'
    );
  });

  // Simulate response for the "Contribution rates" subcategory
  test('should return subcategory response for "Contribution rates"', async () => {
    await Session.updateOne({ userId: 'whatsapp:+972545664886' }, { state: 'subcategory' });

    const twilioMessage = {
      From: 'whatsapp:+972545664886',
      Body: 'Contribution rates'
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Details on Contribution rates are being processed.</Message></Response>'
    );
  });

  // Simulate a new initial state request
  test('should return initial response for "Investment tracks"', async () => {
    await Session.updateOne({ userId: 'whatsapp:+972545664886' }, { state: 'initial' });

    const twilioMessage = {
      From: 'whatsapp:+972545664886',
      Body: 'Investment tracks'
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Would you like to know about risk profiles or fund types?</Message></Response>'
    );
  });

  // Simulate a query for risk profiles
  test('should return category response for "Risk profiles"', async () => {
    await Session.updateOne({ userId: 'whatsapp:+972545664886' }, { state: 'category' });

    const twilioMessage = {
      From: 'whatsapp:+972545664886',
      Body: 'Risk profiles'
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Details on Risk profiles are being processed.</Message></Response>'
    );
  });

  // Simulate a query for fund types
  test('should return category response for "Fund types"', async () => {
    await Session.updateOne({ userId: 'whatsapp:+972545664886' }, { state: 'category' });

    const twilioMessage = {
      From: 'whatsapp:+972545664886',
      Body: 'Fund types'
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Details on Fund types are being processed.</Message></Response>'
    );
  });
});
