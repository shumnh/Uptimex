const express = require('express');
const router = express.Router();

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