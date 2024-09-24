const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app'); // Adjust the path to your Express app
const Session = require('../models/session');
const Response = require('../models/response');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dbTest';

beforeAll(async () => {
  // Connect to MongoDB
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Clear collections before running tests
  await Session.deleteMany({});
  await Response.deleteMany({});

  // Insert initial data into the Session and Response collections
  await Session.insertMany([
    { userId: 'whatsapp:+14155238886', state: 'initial', createdAt: new Date() },
    { userId: 'whatsapp:+0987654321', state: 'initial', createdAt: new Date() }
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

describe('Test the /twilio/webhook endpoint', () => {
  
  test('should return initial response for "kupot gemel" via Twilio sandbox', async () => {
    const twilioMessage = {
      From: 'whatsapp:+14155238886', // Updated to Twilio sandbox number
      Body: 'kupot gemel'            // User's query
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Are you interested in retirement funds, disability insurance, or investment tracks?</Message></Response>'
    );
  });

  test('should return category response for "Retirement funds" via Twilio sandbox', async () => {
    await Session.updateOne({ userId: 'whatsapp:+14155238886' }, { state: 'category' });

    const twilioMessage = {
      From: 'whatsapp:+14155238886', // Updated to Twilio sandbox number
      Body: 'Retirement funds'
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Would you like to know about contribution rates or withdrawal rules?</Message></Response>'
    );
  });

  test('should return subcategory response for "Contribution rates" via Twilio sandbox', async () => {
    await Session.updateOne({ userId: 'whatsapp:+14155238886' }, { state: 'subcategory' });

    const twilioMessage = {
      From: 'whatsapp:+14155238886', // Updated to Twilio sandbox number
      Body: 'Contribution rates'
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Details on Contribution rates are being processed.</Message></Response>'
    );
  });

  test('should return initial response for "Investment tracks" via Twilio sandbox', async () => {
    await Session.updateOne({ userId: 'whatsapp:+14155238886' }, { state: 'initial' });

    const twilioMessage = {
      From: 'whatsapp:+14155238886', // Updated to Twilio sandbox number
      Body: 'Investment tracks'
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Would you like to know about risk profiles or fund types?</Message></Response>'
    );
  });

  test('should return category response for "Risk profiles" via Twilio sandbox', async () => {
    await Session.updateOne({ userId: 'whatsapp:+14155238886' }, { state: 'category' });

    const twilioMessage = {
      From: 'whatsapp:+14155238886', // Updated to Twilio sandbox number
      Body: 'Risk profiles'
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Details on Risk profiles are being processed.</Message></Response>'
    );
  });

  test('should return category response for "Fund types" via Twilio sandbox', async () => {
    await Session.updateOne({ userId: 'whatsapp:+14155238886' }, { state: 'category' });

    const twilioMessage = {
      From: 'whatsapp:+14155238886', // Updated to Twilio sandbox number
      Body: 'Fund types'
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Details on Fund types are being processed.</Message></Response>'
    );
  });

});
