import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Dynamic import for bs58
let bs58: any = null;

const loadBs58 = async () => {
  if (!bs58) {
    try {
      bs58 = await import('https://cdn.jsdelivr.net/npm/bs58@6.0.0/+esm');
    } catch (error) {
      console.error('Failed to load bs58:', error);
      throw new Error('bs58 library not available');
    }
  }
  return bs58;
};

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect(): Promise<{ publicKey: { toString(): string } }>;
      disconnect(): Promise<void>;
      isConnected: boolean;
      publicKey?: { toString(): string };
      signMessage(encodedMessage: Uint8Array, display?: string): Promise<{ signature: Uint8Array }>;
    };
  }
}

function ValidatorLoginPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [validatorInfo, setValidatorInfo] = useState<any>(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role === 'validator' || parsedUser.role === 'user') {
        navigate('/validator');
      }
    }
  }, [navigate]);

  const authenticateValidator = async (address: string) => {
    try {
      setIsAuthenticating(true);
      setError('');
      
      // Load bs58 library
      const bs58Module = await loadBs58();
      
      // Create message to sign
      const message = `Validator login for ${address} at ${Date.now()}`;
      
      // Request signature from wallet
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana!.signMessage(encodedMessage, 'utf8');
      
      // Convert signature to base58
      const signature = bs58Module.default.encode(signedMessage.signature);
      
      // Send to backend for verification
      const response = await fetch('http://localhost:4000/api/auth/validator-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: address,
          message: message,
          signature: signature
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('✅ Validator authenticated successfully');
        navigate('/validator');
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'Failed to authenticate. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const checkValidatorExists = async (address: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/auth/validator-info/${address}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setValidatorInfo(data.validator);
        return true;
      } else {
        setError('No validator account found for this wallet. Please register first.');
        return false;
      }
    } catch (error) {
      setError('Failed to verify validator account. Please try again.');
      return false;
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');
    setValidatorInfo(null);
    
    try {
      // Check if Phantom wallet is installed
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error('Phantom Wallet not found! Please install it from https://phantom.app/');
      }

      // Connect wallet
      const response = await window.solana.connect();
      const address = response.publicKey.toString();
      
      console.log('Wallet connected:', address);
      setWalletAddress(address);
      
      // Check if validator exists and authenticate
      const validatorExists = await checkValidatorExists(address);
      if (validatorExists) {
        await authenticateValidator(address);
      }
      
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const retryAuthentication = async () => {
    if (walletAddress) {
      await authenticateValidator(walletAddress);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%236366f1%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          {/* Back Button */}
          <Link 
            to="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors group font-medium"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          {/* Main Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-10 border border-white/50 shadow-2xl">
            <div className="text-center mb-10">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                Validator Login
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                Connect your registered Solana wallet to access the validator marketplace
              </p>
              <div className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-emerald-700 text-sm font-bold">
                  Secure Validator Access • Earn SOL Rewards
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">{error}</p>
                    {error.includes('No validator account found') && (
                      <Link
                        to="/validator-register"
                        className="mt-4 inline-block w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold py-3 px-6 rounded-xl text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                      >
                        Register as Validator
                      </Link>
                    )}
                    {error.includes('Authentication failed') && walletAddress && (
                      <button
                        onClick={retryAuthentication}
                        disabled={isAuthenticating}
                        className="mt-4 inline-block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50"
                      >
                        {isAuthenticating ? 'Retrying...' : 'Try Again'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {/* Validator Info Display */}
              {validatorInfo && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-emerald-800 font-bold text-lg">Validator Found!</p>
                      <p className="text-emerald-600 text-sm">Welcome back, {validatorInfo.name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-700 font-medium">Name:</span>
                      <span className="text-emerald-800 font-bold">{validatorInfo.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-700 font-medium">Member Since:</span>
                      <span className="text-emerald-800 font-medium">
                        {new Date(validatorInfo.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-700 font-medium">Wallet:</span>
                      <span className="text-emerald-800 font-mono text-xs">
                        {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Connection */}
              <div className="space-y-6">
                {!walletAddress ? (
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="group relative w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold py-5 px-8 rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {isConnecting ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          <span className="text-lg">Connecting Wallet...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl mr-3">👻</span>
                          <span className="text-lg">Connect Phantom Wallet</span>
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-green-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                ) : isAuthenticating ? (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-4"></div>
                      <div className="flex-1">
                        <p className="text-blue-800 font-bold">Authenticating...</p>
                        <p className="text-blue-600 text-sm">Please sign the message in your wallet</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Validator Benefits */}
              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-lg font-bold text-slate-900 text-center mb-6">
                  Validator Benefits
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { icon: '💰', title: 'Earn SOL Rewards', desc: 'Get paid for each website verification' },
                    { icon: '🎯', title: 'Choose Your Work', desc: 'Select which websites to monitor' },
                    { icon: '⚡', title: 'Instant Payments', desc: 'Receive SOL immediately after validation' },
                    { icon: '📊', title: 'Performance Tracking', desc: 'Monitor your earnings and accuracy' }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-2xl mr-4">{benefit.icon}</span>
                      <div>
                        <h4 className="font-bold text-slate-900">{benefit.title}</h4>
                        <p className="text-slate-600 text-sm">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Actions */}
              <div className="text-center border-t border-slate-200 pt-8">
                <p className="text-slate-600 mb-4 font-medium">
                  Don't have a validator account yet?
                </p>
                <Link 
                  to="/validator-register"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-300"
                >
                  Register as Validator
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ValidatorLoginPage; 