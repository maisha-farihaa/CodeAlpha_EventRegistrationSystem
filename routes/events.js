const express = require('express');
const router = express.Router();
const db = require('../db');

// get all events
router.get('/', (req, res) => {
  const events = db.prepare('SELECT * FROM events ORDER BY event_date ASC').all();
  res.json(events);
});
