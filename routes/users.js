var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => { 
  res.json([{ name: 'John Doe', email: 'john@example.com' }]); }); 

module.exports = router;
