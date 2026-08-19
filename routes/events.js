const express = require('express');
const router = express.Router();
const db = require('../db');

// get all events
router.get('/', (req, res) => {
  const events = db.prepare('SELECT * FROM events ORDER BY event_date ASC').all();
  res.json(events);
});

// get single event
router.get('/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);

  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const count = db.prepare('SELECT COUNT(*) AS total FROM registrations WHERE event_id = ?').get(event.id);
  event.registered = count.total;

  res.json(event);
});

// create a new event
router.post('/', (req, res) => {
  const { title, description, event_date, location, capacity } = req.body;

  if (!title || !event_date) {
    return res.status(400).json({ error: 'title and event_date are required.' });
  }

  const insert = db.prepare(`
    INSERT INTO events (title, description, event_date, location, capacity)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = insert.run(title, description || '', event_date, location || '', capacity || 50);

  const newEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newEvent);
});

module.exports = router;
