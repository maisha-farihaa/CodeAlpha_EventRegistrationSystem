require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const eventRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/events', eventRoutes);


