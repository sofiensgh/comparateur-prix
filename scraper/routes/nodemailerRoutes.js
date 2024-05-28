const express = require('express');
const router = express.Router();
const nodemailerController = require('../controllers/nodemailerController');

// POST route to send email
router.post('/send', nodemailerController.sendEmail);

module.exports = router;
