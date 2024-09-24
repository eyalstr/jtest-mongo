const express = require('express');
const router = express.Router();
const Session = require('../models/session');
const Response = require('../models/response');

router.post('/webhook', async (req, res) => {
  try {
    const userId = req.body.From || req.body.userId; // From for Twilio, userId for direct queries
    const userQuery = req.body.Body || req.body.query; // Body for Twilio, query for direct queries

    let session = await Session.findOne({ userId });

    // If no session exists for the user, create a new one (this is typical in WhatsApp use cases)
    if (!session) {
      session = new Session({ userId, state: 'initial', createdAt: new Date() });
      await session.save();
    }

    // Find the response based on the user's state and query
    const response = await Response.findOne({ state: session.state, query: userQuery });

    if (!response) {
      return res.status(200).send(`<Response><Message>Sorry, I didn’t understand that. Could you rephrase your question?</Message></Response>`);
    }

    // Update session state based on query progression
    if (session.state === 'initial') {
      session.state = 'category';
    } else if (session.state === 'category') {
      session.state = 'subcategory';
    } else if (session.state === 'subcategory') {
      session.state = 'completed';
    }
    await session.save();

    // Send the Twilio formatted response
    res.status(200).send(`<Response><Message>${response.responseMessage}</Message></Response>`);

  } catch (error) {
    console.error(error);
    res.status(500).send(`<Response><Message>An error occurred.</Message></Response>`);
  }
});

module.exports = router;
