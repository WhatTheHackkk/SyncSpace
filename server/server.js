import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import feedRoutes from './routes/feed.js';
import joinRoutes from './routes/join.js';
import User from './models/User.js';
import Event from './models/Event.js';
import Post from './models/Post.js';
import { connectDB } from './db.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware for clean debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Primary Routes
app.use('/api/feed', feedRoutes);
app.use('/api/join', joinRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'SyncSpace Backend API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Helper endpoint to fetch test users for the frontend user switcher
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ semester: 1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper endpoint to fetch all upcoming events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ deadlineDate: 1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper endpoint to create a new teammate request post
app.post('/api/posts', async (req, res) => {
  try {
    const { posterId, eventId, isSpecificRoleNeeded, requestedSkills } = req.body;
    if (!posterId || !eventId || !requestedSkills) {
      return res.status(400).json({
        success: false,
        message: 'posterId, eventId, and requestedSkills are required',
      });
    }

    const post = await Post.create({
      posterId,
      eventId,
      isSpecificRoleNeeded: Boolean(isSpecificRoleNeeded),
      requestedSkills,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('posterId', 'name collegeEmail semester')
      .populate('eventId');

    res.status(201).json({ success: true, post: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
  });
});

// Connect to database, seed if empty, and start server
async function startServer() {
  try {
    await connectDB();

    // Auto-seed if database is freshly initialized or empty
    const postCount = await Post.countDocuments();
    if (postCount === 0) {
      console.log('Database empty on startup. Automatically seeding test data...');
      await seedDatabase(true);
    }

    app.listen(PORT, () => {
      console.log(`🚀 SyncSpace API Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server database:', error.message);
    app.listen(PORT, () => {
      console.log(`🚀 SyncSpace API Server is running on http://localhost:${PORT} (offline fallback)`);
    });
  }
}

startServer();

export default app;
