const express = require('express');
const router = express.Router();
const Session = require('../models/session');
const Response = require('../models/response');

router.post('/', async (req, res) => {
  const { userId, query } = req.body;

  try {
    // Find the user's session
    const session = await Session.findOne({ userId });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Find the appropriate response based on the user's session state and query
    const response = await Response.findOne({ state: session.state, query });

    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Update the session state if necessary
    if (response.state === 'completed') {
      await Session.updateOne({ userId }, { state: 'initial' }); // Reset state after completing
    }

    // Send the response back to the user
    res.json({ responseMessage: response.responseMessage });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
