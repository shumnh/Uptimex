import jwt from 'jsonwebtoken';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';
import User from '../models/User.js';

// Helper to verify Solana signature
function verifySolanaSignature(message, signature, publicKey) {
  try {
    const msgUint8 = new TextEncoder().encode(message);
    const sigUint8 = bs58.decode(signature);
    const pubKeyUint8 = new PublicKey(publicKey).toBytes();
    return nacl.sign.detached.verify(msgUint8, sigUint8, pubKeyUint8);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export const loginWithWallet = async (req, res) => {
  const { wallet, message, signature } = req.body;
  if (!wallet || !message || !signature) {
    return res.status(400).json({ error: 'Missing wallet, message, or signature' });
  }
  // Verify signature
  const valid = verifySolanaSignature(message, signature, wallet);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  // Find or create user
  let user = await User.findOne({ solanaWallet: wallet });
  if (!user) {
    user = await User.create({
      username: wallet,
      solanaWallet: wallet,
      role: 'validator'
      // No email needed for validators
    });
  }
  // Issue JWT
  const token = jwt.sign(
    { id: user._id, wallet: user.solanaWallet, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({
    token,
    user: {
      id: user._id,
      wallet: user.solanaWallet,
      role: user.role
    }
  });
}; 