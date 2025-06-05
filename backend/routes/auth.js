const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/passwordUtils');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  
  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ 
      error: 'Password does not meet requirements',
      details: passwordValidation.errors
    });
  }
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash the password using utility function
    const passwordHash = await hashPassword(password);
    
    const user = await User.create({
      username,
      email,
      passwordHash,
      role: role || 'user'
    });
    
    console.log(`✅ New user registered: ${email} with role: ${user.role}`);
    
    res.status(201).json({ 
      message: 'User registered successfully', 
      user: { 
        id: user._id, 
        email: user.email, 
        username: user.username,
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    // Explicitly select passwordHash since it's set to select: false in the model
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Compare the provided password with the hashed password using utility function
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign({ 
      id: user._id, 
      email: user.email, 
      role: user.role,
      solanaWallet: user.solanaWallet // Include wallet if exists
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    console.log(`✅ User logged in: ${email}`);
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        username: user.username,
        role: user.role,
        solanaWallet: user.solanaWallet 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Use dynamic import for the .mjs file
let loginWithWallet;
import('../controllers/authController.mjs').then(module => {
  loginWithWallet = module.loginWithWallet;
});

router.post('/wallet-login', async (req, res) => {
  if (!loginWithWallet) {
    return res.status(500).json({ error: 'Module not loaded yet' });
  }
  return loginWithWallet(req, res);
});

module.exports = router; 