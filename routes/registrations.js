const express = require('express');
const router = express.Router();
const db = require('../db');

// register for an event
router.post('/events/:id/register', (req, res) => {
  const { name, email } = req.body;
  const eventId = req.params.id;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required.' });
  }

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const count = db.prepare('SELECT COUNT(*) AS total FROM registrations WHERE event_id = ?').get(eventId);
  if (count.total >= event.capacity) {
    return res.status(400).json({ error: 'This event is full.' });
  }

  try {
    const insert = db.prepare('INSERT INTO registrations (event_id, name, email) VALUES (?, ?, ?)');
    const result = insert.run(eventId, name, email);
    const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(registration);
  } catch (err) {
    res.status(409).json({ error: 'This email is already registered for this event.' });
  }
});

// view all registrations for a given email
router.get('/registrations', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Please provide an email query param.' });
  }

  const rows = db.prepare(`
    SELECT registrations.id, registrations.name, registrations.email, registrations.created_at,
           events.title, events.event_date, events.location
    FROM registrations
    JOIN events ON events.id = registrations.event_id
    WHERE registrations.email = ?
    ORDER BY events.event_date ASC
  `).all(email);

  res.json(rows);
});

// cancel a registration
router.delete('/registrations/:id', (req, res) => {
  const result = db.prepare('DELETE FROM registrations WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Registration not found.' });
  }

  res.json({ message: 'Registration cancelled.' });
});

module.exports = router;
