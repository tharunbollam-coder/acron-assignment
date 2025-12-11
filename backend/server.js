const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: ['https://acron-assignment-2qsb.vercel.app/', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/courts', require('./routes/courts'));
app.use('/api/coaches', require('./routes/coaches'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/pricing', require('./routes/pricing'));
app.use('/api/admin', require('./routes/admin'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Sports Facility Booking API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
