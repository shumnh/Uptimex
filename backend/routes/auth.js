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
  
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  // For validators, use the signature-based authentication
  if (userType === 'validator') {
    if (!loginWithWallet) {
      return res.status(500).json({ error: 'Module not loaded yet' });
    }
    return loginWithWallet(req, res);
  }
  
  // For website owners: SIMPLE - wallet connected = you're in!
  if (userType === 'user') {
    try {
      // Find user by wallet address
      let user = await User.findOne({ solanaWallet: walletAddress, role: 'user' });
      
      // If user doesn't exist, create them automatically
      if (!user) {
        try {
          // Generate a unique username
          const baseUsername = `user_${walletAddress.slice(-8)}`;
          let username = baseUsername;
          let counter = 1;
          
          // Check if username exists and increment counter if needed
          while (await User.findOne({ username })) {
            username = `${baseUsername}_${counter}`;
            counter++;
          }
          
          const userData = {
            username,
            role: 'user',
            solanaWallet: walletAddress
          };
          
          user = await User.create(userData);
          console.log(`✅ New website owner auto-registered with wallet: ${walletAddress}, username: ${username}`);
        } catch (createError) {
          console.error('User creation error:', createError);
          // If duplicate key error, try to find the existing user
          if (createError.code === 11000) {
            console.log(`🔍 Duplicate key error, finding existing user with wallet: ${walletAddress}`);
            user = await User.findOne({ solanaWallet: walletAddress });
            if (!user) {
              throw new Error('User creation failed and existing user not found');
            }
            // If user exists but has wrong role, update the role
            if (user.role !== 'user') {
              user.role = 'user';
              await user.save();
              console.log(`✅ Updated existing user role to 'user' for wallet: ${walletAddress}`);
            }
          } else {
            throw createError;
          }
        }
      }
      
      // Create JWT token
      const token = jwt.sign({ 
        id: user._id, 
        username: user.username,
        role: user.role,
        solanaWallet: user.solanaWallet
      }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      console.log(`✅ Website owner logged in with wallet: ${walletAddress}`);
      
      res.json({ 
        token, 
        user: { 
          id: user._id, 
          username: user.username,
          role: user.role,
          solanaWallet: user.solanaWallet 
        } 
      });
    } catch (err) {
      console.error('Wallet login error:', err);
      console.error('Error details:', err.message);
      console.error('Error stack:', err.stack);
      res.status(500).json({ 
        error: 'Login failed', 
        details: err.message,
        walletAddress: walletAddress 
      });
    }
  } else {
    return res.status(400).json({ error: 'Invalid user type' });
  }
});

// POST /api/auth/validator-register
router.post('/validator-register', async (req, res) => {
  const { name, email, wallet, message, signature } = req.body;
  
  if (!name || !wallet || !message || !signature) {
    return res.status(400).json({ error: 'Name, wallet, message, and signature are required' });
  }
  
  try {
    // Check if validator already exists with this wallet
    const existingValidator = await User.findOne({ solanaWallet: wallet, role: 'validator' });
    if (existingValidator) {
      return res.status(400).json({ error: 'Validator already registered with this wallet' });
    }
    
    // For now, we'll skip signature verification and focus on functionality
    // In production, you would verify the signature here
    
    // Generate a unique username for validator (max 30 chars)
    const cleanName = name.toLowerCase().replace(/\s+/g, '_').slice(0, 10); // Limit name to 10 chars
    const walletSuffix = wallet.slice(-4); // Use last 4 chars of wallet
    const baseUsername = `val_${cleanName}_${walletSuffix}`; // Format: val_name_1234 (max ~20 chars)
    let username = baseUsername;
    let counter = 1;
    
    // Check if username exists and increment counter if needed
    while (await User.findOne({ username })) {
      username = `${baseUsername}_${counter}`;
      counter++;
      // Ensure we don't exceed 30 characters
      if (username.length > 30) {
        username = `val_${cleanName.slice(0, 5)}_${walletSuffix}_${counter}`;
      }
    }
    
    const userData = {
      username,
      email: email || `validator_${wallet.slice(0, 8)}@uptimex.com`,
      role: 'validator',
      solanaWallet: wallet,
      name: name
    };
    
    const validator = await User.create(userData);
    
    console.log(`✅ New validator registered: ${name}`);
    
    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET environment variable is missing!');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Create JWT token
    const token = jwt.sign({ 
      id: validator._id, 
      email: validator.email, 
      role: validator.role,
      solanaWallet: validator.solanaWallet,
      name: validator.name
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
      message: 'Validator registered successfully',
      token,
      user: { 
        id: validator._id, 
        email: validator.email, 
        username: validator.username,
        name: validator.name,
        role: validator.role,
        solanaWallet: validator.solanaWallet
      } 
    });
  } catch (err) {
    console.error('Validator registration error:', err.message);
    
    // Handle specific MongoDB errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      if (field === 'solanaWallet') {
        return res.status(400).json({ 
          error: 'Validator already registered with this wallet address' 
        });
      } else {
        return res.status(400).json({ 
          error: `${field} already exists` 
        });
      }
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET /api/auth/user-info/:wallet - Check if website owner exists
router.get('/user-info/:wallet', async (req, res) => {
  const { wallet } = req.params;
  
  try {
    const user = await User.findOne({ solanaWallet: wallet, role: 'user' });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found', exists: false });
    }
    
    res.json({
      success: true,
      exists: true,
      user: {
        username: user.username,
        email: user.email,
        wallet: user.solanaWallet
      }
    });
  } catch (err) {
    console.error('User info error:', err);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// GET /api/auth/validator-info/:wallet
router.get('/validator-info/:wallet', async (req, res) => {
  const { wallet } = req.params;
  
  try {
    const validator = await User.findOne({ solanaWallet: wallet, role: 'validator' });
    
    if (!validator) {
      return res.status(404).json({ error: 'Validator not found' });
    }
    
    res.json({
      success: true,
      validator: {
        name: validator.name || validator.username,
        wallet: validator.solanaWallet
      }
    });
  } catch (err) {
    console.error('Validator info error:', err);
    res.status(500).json({ error: 'Failed to get validator info' });
  }
});

// POST /api/auth/validator-login
router.post('/validator-login', async (req, res) => {
  const { wallet, message, signature } = req.body;
  
  if (!wallet || !message || !signature) {
    return res.status(400).json({ error: 'Wallet, message, and signature are required' });
  }
  
  try {
    // Find validator by wallet address
    const validator = await User.findOne({ solanaWallet: wallet, role: 'validator' });
    if (!validator) {
      return res.status(404).json({ error: 'Validator not found with this wallet address' });
    }
    
    // For now, we'll skip signature verification and focus on functionality
    // In production, you would verify the signature here
    
    // Create JWT token
    const token = jwt.sign({ 
      id: validator._id, 
      email: validator.email, 
      role: validator.role,
      solanaWallet: validator.solanaWallet,
      name: validator.name
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    console.log(`✅ Validator logged in: ${validator.name} with wallet: ${wallet}`);
    
    res.json({ 
      token, 
      user: { 
        id: validator._id, 
        email: validator.email, 
        username: validator.username,
        name: validator.name || validator.username,
        role: validator.role,
        solanaWallet: validator.solanaWallet 
      } 
    });
  } catch (err) {
    console.error('Validator login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router; 