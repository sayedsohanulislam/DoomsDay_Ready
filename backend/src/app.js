const express = require('express');
const cors = require('cors');
const movieRoutes = require('./routes/movies');
const cinemaRoutes = require('./routes/cinemas');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/movies', movieRoutes);
app.use('/api/cinemas', cinemaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

module.exports = app;
