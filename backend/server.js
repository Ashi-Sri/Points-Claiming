const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Points History Schema
const pointsHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  pointsAwarded: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);
const PointsHistory = mongoose.model('PointsHistory', pointsHistorySchema);

// Initialize default users
const initializeUsers = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const defaultUsers = [
        'Rahul', 'Kamal', 'Sanak', 'Priya', 'Amit', 
        'Sneha', 'Vikash', 'Pooja', 'Ravi', 'Neha'
      ];
      
      const users = defaultUsers.map(name => ({ name, totalPoints: 0 }));
      await User.insertMany(users);
      await updateRankings();
      console.log('Default users initialized');
    }
  } catch (error) {
    console.error('Error initializing users:', error);
  }
};

// Update rankings for all users
const updateRankings = async () => {
  try {
    const users = await User.find().sort({ totalPoints: -1 });
    
    for (let i = 0; i < users.length; i++) {
      users[i].rank = i + 1;
      await users[i].save();
    }
    
    return users;
  } catch (error) {
    console.error('Error updating rankings:', error);
    throw error;
  }
};

// Routes

// Get all users with rankings
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ totalPoints: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new user
app.post('/api/users', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const newUser = new User({ name, totalPoints: 0 });
    await newUser.save();
    
    const updatedUsers = await updateRankings();
    io.emit('usersUpdated', updatedUsers);
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Claim points for a user
app.post('/api/claim-points', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate random points between 1 and 10
    const randomPoints = Math.floor(Math.random() * 10) + 1;
    
    // Update user's total points
    user.totalPoints += randomPoints;
    await user.save();
    
    // Create points history entry
    const historyEntry = new PointsHistory({
      userId: user._id,
      userName: user.name,
      pointsAwarded: randomPoints
    });
    await historyEntry.save();
    
    // Update rankings for all users
    const updatedUsers = await updateRankings();
    
    // Emit real-time updates
    io.emit('pointsClaimed', {
      user: user,
      pointsAwarded: randomPoints,
      users: updatedUsers
    });
    
    res.json({
      message: 'Points claimed successfully',
      pointsAwarded: randomPoints,
      user: user,
      users: updatedUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get points history
app.get('/api/points-history', async (req, res) => {
  try {
    const history = await PointsHistory.find()
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get points history for a specific user
app.get('/api/points-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await PointsHistory.find({ userId })
      .sort({ timestamp: -1 })
      .limit(20);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

mongoose.connection.once('open', async () => {
  console.log('Connected to MongoDB');
  await initializeUsers();
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
