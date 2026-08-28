const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const inMemoryStore = require('../store/inMemoryStore');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, rollNumber, department, semester, hostelBlock, roomNumber, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await inMemoryStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await inMemoryStore.createUser({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: ROLES.STUDENT,
      rollNumber: rollNumber || `STD-${Date.now().toString().slice(-4)}`,
      department: department || 'General Engineering',
      semester: semester || '1st Sem',
      hostelBlock: hostelBlock || 'Day Scholar',
      roomNumber: roomNumber || '',
      phone: phone || '',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    });

    const token = generateToken(user._id);

    const { password: _, ...safeUser } = user;

    res.status(201).json({
      success: true,
      token,
      user: safeUser,
      message: 'Student account registered successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await inMemoryStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or user not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check password.' });
    }

    const token = generateToken(user._id);
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      token,
      user: safeUser,
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

// @desc    Instant Demo Login for testing
// @route   POST /api/auth/demo-login
// @access  Public
const demoLogin = async (req, res, next) => {
  try {
    const { role = 'student' } = req.body;

    let targetEmail = 'student@campus.edu';
    if (role === 'staff' || role === 'staff.hostel') targetEmail = 'staff.hostel@campus.edu';
    else if (role === 'staff.wifi') targetEmail = 'staff.wifi@campus.edu';
    else if (role === 'staff.maintenance') targetEmail = 'staff.maintenance@campus.edu';
    else if (role === 'admin') targetEmail = 'admin@campus.edu';
    else if (role === 'superadmin' || role === 'principal') targetEmail = 'principal@campus.edu';

    const user = await inMemoryStore.findUserByEmail(targetEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: `Demo user for role ${role} not found.` });
    }

    const token = generateToken(user._id);
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      token,
      user: safeUser,
      message: `Switched session to ${user.name} (${user.role.toUpperCase()})`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  demoLogin
};
