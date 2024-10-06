const express = require('express');
const router = express.Router();
const Session = require('../models/session');
const Response = require('../models/response');

router.post('/webhook', async (req, res) => {
  try {
    const userId = req.body.From || req.body.userId;
    const userQuery = req.body.Body || req.body.query;

    console.log('Received userId:', userId);
    console.log('Received userQuery:', userQuery);

    let session = await Session.findOne({ userId });
    console.log('Session found:', session);

    if (!session) {
      session = new Session({ userId, state: 'initial', createdAt: new Date() });
      await session.save();
      console.log('New session created:', session);
    }

    const response = await Response.findOne({ state: session.state, query: userQuery });
    console.log('Response found:', response);

    if (!response) {
      return res.status(200).send(`<Response><Message>Sorry, I didn’t understand that. Could you rephrase your question?</Message></Response>`);
    }

    // Update session state and save it
    if (session.state === 'initial') {
      session.state = 'category';
    } else if (session.state === 'category') {
      session.state = 'subcategory';
    } else if (session.state === 'subcategory') {
      session.state = 'completed';
    }
    await session.save();
    
    res.status(200).send(`<Response><Message>${response.responseMessage}</Message></Response>`);

  } catch (error) {
    console.error('Error in /twilio/webhook handler:', error);
    res.status(500).send(`<Response><Message>An error occurred.</Message></Response>`);
  }
});


module.exports = router;
