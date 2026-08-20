const express = require('express');
const router = express.Router();
const { getDb, saveDb, selectAll, selectOne } = require('../db');

const ORGANIZER_PASSWORD = 'maisha123';

// checks the x-organizer-password header before allowing create/delete
function requireOrganizer(req, res, next) {
  const password = req.headers['x-organizer-password'];

  if (password !== ORGANIZER_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect organizer password.' });
  }

  next();
}

// get all events
router.get('/', (req, res) => {
  const events = selectAll('SELECT * FROM events ORDER BY event_date ASC');
  res.json(events);
});

// get single event with how many people already registered
router.get('/:id', (req, res) => {
  const event = selectOne('SELECT * FROM events WHERE id = ?', [req.params.id]);

  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const count = selectOne('SELECT COUNT(*) AS total FROM registrations WHERE event_id = ?', [event.id]);
  event.registered = count.total;

  res.json(event);
});

// checks whether the password given is correct
router.post('/verify-organizer', requireOrganizer, (req, res) => {
  res.json({ ok: true });
});

// create a new event (organizer only)
router.post('/', requireOrganizer, (req, res) => {
  const { title, description, event_date, location, capacity } = req.body;

  if (!title || !event_date) {
    return res.status(400).json({ error: 'title and event_date are required.' });
  }

  const db = getDb();
  db.run(
    'INSERT INTO events (title, description, event_date, location, capacity) VALUES (?, ?, ?, ?, ?)',
    [title, description || '', event_date, location || '', capacity || 50]
  );
  saveDb();

  const newEvent = selectOne('SELECT * FROM events ORDER BY id DESC LIMIT 1');
  res.status(201).json(newEvent);
});

// delete an event (organizer only)
router.delete('/:id', requireOrganizer, (req, res) => {
  const event = selectOne('SELECT * FROM events WHERE id = ?', [req.params.id]);

  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const db = getDb();
  db.run('DELETE FROM registrations WHERE event_id = ?', [req.params.id]);
  db.run('DELETE FROM events WHERE id = ?', [req.params.id]);
  saveDb();

  res.json({ message: 'Event deleted.' });
});

module.exports = router;