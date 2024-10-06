const mongoose = require('mongoose');
const Session = require('./models/session');
const Response = require('./models/response');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI_PROD || 'mongodb://localhost:27017/dbProductionTest';

async function seedDatabase() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear collections before seeding
    await Session.deleteMany({});
    await Response.deleteMany({});

    // Insert initial data into the Session collection
    await Session.insertMany([
      { userId: 'whatsapp:+972545664886', state: 'initial', createdAt: new Date() },
      { userId: 'whatsapp:+0987654321', state: 'initial', createdAt: new Date() }
    ]);

    // Insert initial data into the Response collection
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

    // Ensure all sessions start from the 'initial' state
    await Session.updateMany({}, { $set: { state: 'initial' } });

    console.log('Database seeding completed successfully.');
  } catch (err) {
    console.error('Database seeding failed:', err);
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase();
