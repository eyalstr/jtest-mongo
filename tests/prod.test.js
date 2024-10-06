const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app'); // Adjust the path to your Express app
const Session = require('../models/session');
const Response = require('../models/response');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI_PROD || 'mongodb://localhost:27017/dbProductionTest';

// beforeAll(async () => {
//   // Connect to MongoDB (both for test and production environments)
//   await mongoose.connect(mongoUri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });

//   // Clear collections before running tests (affects both environments)
//   await Session.deleteMany({});
//   await Response.deleteMany({});

//   // Insert initial data into the Session and Response collections
//   await Session.insertMany([
//     { userId: 'whatsapp:+972545664886', state: 'initial', createdAt: new Date() },
//     { userId: 'whatsapp:+0987654321', state: 'initial', createdAt: new Date() }
//   ]);

//   await Response.insertMany([
//     { state: 'initial', query: 'kupot gemel', responseMessage: 'Are you interested in retirement funds, disability insurance, or investment tracks?' },
//     { state: 'category', query: 'Retirement funds', responseMessage: 'Would you like to know about contribution rates or withdrawal rules?' },
//     { state: 'subcategory', query: 'Contribution rates', responseMessage: 'Details on Contribution rates are being processed.' },
//     { state: 'subcategory', query: 'Withdrawal rules', responseMessage: 'Details on Withdrawal rules are being processed.' },
//     { state: 'initial', query: 'Investment tracks', responseMessage: 'Would you like to know about risk profiles or fund types?' },
//     { state: 'category', query: 'Risk profiles', responseMessage: 'Details on Risk profiles are being processed.' },
//     { state: 'category', query: 'Fund types', responseMessage: 'Details on Fund types are being processed.' },
//     { state: 'completed', query: '', responseMessage: 'Your query is complete. If you have more questions, please start a new session.' }
//   ]);
// });
beforeAll(async () => {
  // Connect to MongoDB, assume data is already seeded
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});


afterAll(async () => {
  // Close the MongoDB connection (applies to both environments)
  await mongoose.connection.close();
});

describe('Test the /twilio/webhook endpoint', () => {

  test('should return initial response for "kupot gemel" via client WhatsApp number', async () => {
    // Reset session state to 'initial'
    await Session.updateOne({ userId: 'whatsapp:+972545664886' }, { state: 'initial' });


    const twilioMessage = {
      From: 'whatsapp:+972545664886', // Simulated client WhatsApp number
      Body: 'kupot gemel'              // User's query
    };


  const response = await request(app).post('/twilio/webhook').send(twilioMessage);
  
  console.log('Received message:', response.text);  // Log the full response

  expect(response.status).toBe(200);
  expect(response.text).toBe(
    '<Response><Message>Are you interested in retirement funds, disability insurance, or investment tracks?</Message></Response>'
  );

    // const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    // console.log('Received message:', response.body.Body);
    // expect(response.status).toBe(200);
    // expect(response.text).toBe(
    //   '<Response><Message>Are you interested in retirement funds, disability insurance, or investment tracks?</Message></Response>'
    // );
  });

  test('should return category response for "Retirement funds" via client WhatsApp number', async () => {
    await Session.updateOne({ userId: 'whatsapp:+972545664886' }, { state: 'category' });

    const twilioMessage = {
      From: 'whatsapp:+972545664886', // Simulated client WhatsApp number
      Body: 'Retirement funds'
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Would you like to know about contribution rates or withdrawal rules?</Message></Response>'
    );
  });

  test('should return subcategory response for "Contribution rates" via client WhatsApp number', async () => {
    await Session.updateOne({ userId: 'whatsapp:+972545664886' }, { state: 'subcategory' });

    const twilioMessage = {
      From: 'whatsapp:+972545664886', // Simulated client WhatsApp number
      Body: 'Contribution rates'
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Details on Contribution rates are being processed.</Message></Response>'
    );
  });

  test('should return initial response for "Investment tracks" via client WhatsApp number', async () => {
    await Session.updateOne({ userId: 'whatsapp:+972545664886' }, { state: 'initial' });

    const twilioMessage = {
      From: 'whatsapp:+972545664886', // Simulated client WhatsApp number
      Body: 'Investment tracks'
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Would you like to know about risk profiles or fund types?</Message></Response>'
    );
  });

  test('should return category response for "Risk profiles" via client WhatsApp number', async () => {
    await Session.updateOne({ userId: 'whatsapp:+972545664886' }, { state: 'category' });

    const twilioMessage = {
      From: 'whatsapp:+972545664886', // Simulated client WhatsApp number
      Body: 'Risk profiles'
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Details on Risk profiles are being processed.</Message></Response>'
    );
  });

  test('should return category response for "Fund types" via client WhatsApp number', async () => {
    await Session.updateOne({ userId: 'whatsapp:+972545664886' }, { state: 'category' });

    const twilioMessage = {
      From: 'whatsapp:+972545664886', // Simulated client WhatsApp number
      Body: 'Fund types'
    };

    const response = await request(app).post('/twilio/webhook').send(twilioMessage);
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      '<Response><Message>Details on Fund types are being processed.</Message></Response>'
    );
  });

});
