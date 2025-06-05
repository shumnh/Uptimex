const bcrypt = require('bcrypt');

// Configuration
const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }
  
  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new Error(`Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`);
  }
  
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if passwords match
 */
async function comparePassword(password, hashedPassword) {
  if (!password || !hashedPassword) {
    return false;
  }
  
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and errors
 */
function validatePasswordStrength(password) {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }
  
  if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push(`Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`);
  }
  
  // Optional: Add more strength requirements
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password should contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password should contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password should contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: errors.length === 0 ? 'strong' : errors.length <= 2 ? 'medium' : 'weak'
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH
}; 