const express = require('express');
const router = express.Router();
const { getDb, saveDb, selectAll, selectOne } = require('../db');

// register for an event
router.post('/events/:id/register', (req, res) => {
  const { name, email } = req.body;
  const eventId = req.params.id;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required.' });
  }

  const event = selectOne('SELECT * FROM events WHERE id = ?', [eventId]);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const count = selectOne('SELECT COUNT(*) AS total FROM registrations WHERE event_id = ?', [eventId]);
  if (count.total >= event.capacity) {
    return res.status(400).json({ error: 'This event is full.' });
  }

  const already = selectOne('SELECT * FROM registrations WHERE event_id = ? AND email = ?', [eventId, email]);
  if (already) {
    return res.status(409).json({ error: 'This email is already registered for this event.' });
  }

  const db = getDb();
  db.run('INSERT INTO registrations (event_id, name, email) VALUES (?, ?, ?)', [eventId, name, email]);
  saveDb();

  const registration = selectOne('SELECT * FROM registrations ORDER BY id DESC LIMIT 1');
  res.status(201).json(registration);
});

// view all registrations for a given email
router.get('/registrations', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Please provide an email query param.' });
  }

  const rows = selectAll(`
    SELECT registrations.id, registrations.name, registrations.email, registrations.created_at,
           events.title, events.event_date, events.location
    FROM registrations
    JOIN events ON events.id = registrations.event_id
    WHERE registrations.email = ?
    ORDER BY events.event_date ASC
  `, [email]);

  res.json(rows);
});

// cancel a registration
router.delete('/registrations/:id', (req, res) => {
  const existing = selectOne('SELECT * FROM registrations WHERE id = ?', [req.params.id]);

  if (!existing) {
    return res.status(404).json({ error: 'Registration not found.' });
  }

  const db = getDb();
  db.run('DELETE FROM registrations WHERE id = ?', [req.params.id]);
  saveDb();

  res.json({ message: 'Registration cancelled.' });
});

module.exports = router;