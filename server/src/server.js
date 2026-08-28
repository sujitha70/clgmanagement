require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const slaEscalationService = require('./services/slaEscalationService');

// Route imports
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Attach io instance to app
app.set('io', io);

// Setup Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to WebSocket: ${socket.id}`);

  socket.on('join_user', (userId) => {
    if (userId) socket.join(`user_${userId}`);
  });

  socket.on('join_complaint', (ticketId) => {
    if (ticketId) socket.join(`ticket_${ticketId}`);
  });

  socket.on('disconnect', () => {
    // client disconnected
  });
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root API welcome endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    name: '🎓 CampusResolve College Grievance Engine API',
    version: '1.0.0',
    health: '/api/health',
    endpoints: {
      auth: '/api/auth',
      complaints: '/api/complaints',
      admin: '/api/admin',
      analytics: '/api/analytics',
      notifications: '/api/notifications'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'CampusResolve College Grievance Engine',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();

  // Start SLA periodic escalation monitor (checks every 60s)
  slaEscalationService.startPeriodicChecker(io, 60000);

  server.listen(PORT, () => {
    console.log(`
===========================================================
🎓 CampusResolve - College Grievance Management Platform
🚀 Server listening on: http://localhost:${PORT}
⚡ WebSocket Engine: Active
📦 In-Memory Store: Ready with pre-seeded demo data
===========================================================
    `);
  });
};

startServer();

module.exports = { app, server };
