const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/passwordUtils');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password, role, solanaWallet } = req.body;
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
    // Check for existing user by email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Check for existing user by wallet address (if provided)
    if (solanaWallet) {
      const existingUserByWallet = await User.findOne({ solanaWallet });
      if (existingUserByWallet) {
        return res.status(400).json({ error: 'Wallet address already registered' });
      }
    }
    
    // Hash the password using utility function
    const passwordHash = await hashPassword(password);
    
    const userData = {
      username,
      email,
      passwordHash,
      role: role || 'user'
    };
    
    // Add wallet address if provided
    if (solanaWallet) {
      userData.solanaWallet = solanaWallet;
    }
    
    const user = await User.create(userData);
    
    console.log(`✅ New user registered: ${email} with role: ${user.role}${solanaWallet ? ` and wallet: ${solanaWallet}` : ''}`);
    
    // Create JWT token
    const token = jwt.sign({ 
      id: user._id, 
      email: user.email, 
      role: user.role,
      solanaWallet: user.solanaWallet
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
      message: 'User registered successfully',
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
  const { walletAddress, userType } = req.body;
  
  // For validators, use the signature-based authentication
  if (userType === 'validator') {
    if (!loginWithWallet) {
      return res.status(500).json({ error: 'Module not loaded yet' });
    }
    return loginWithWallet(req, res);
  }
  
  // For website owners (users), use simplified wallet authentication
  if (userType === 'user') {
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    try {
      // Find user by wallet address
      const user = await User.findOne({ solanaWallet: walletAddress, role: 'user' });
      if (!user) {
        return res.status(404).json({ error: 'User not found with this wallet address' });
      }
      
      // Create JWT token
      const token = jwt.sign({ 
        id: user._id, 
        email: user.email, 
        role: user.role,
        solanaWallet: user.solanaWallet
      }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      console.log(`✅ Website owner logged in with wallet: ${walletAddress}`);
      
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
      console.error('Wallet login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  } else {
    return res.status(400).json({ error: 'Invalid user type' });
  }
});

module.exports = router; 