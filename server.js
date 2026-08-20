require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { initDb } = require('./db');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/api/events', eventRoutes);
app.use('/api', registrationRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// sql.js needs to load its WASM engine first, so we wait for that before listening
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Event Registration server running on http://localhost:${PORT}`);
  });
});