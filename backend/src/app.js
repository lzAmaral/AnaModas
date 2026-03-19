const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', routes);

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

module.exports = app;
