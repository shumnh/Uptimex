require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const websiteRoutes = require('./routes/websites');
const checkRoutes = require('./routes/checks');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT;


app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 200, message: 'Backend is running!' });
});

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/checks', checkRoutes);
app.use('/api/users', usersRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
