import { useState } from 'react';
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

function ValidatorLoginPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [validatorInfo, setValidatorInfo] = useState<{name: string} | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'connect' | 'confirm' | 'complete'>('connect');
  const navigate = useNavigate();

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');
    
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
      
      // Check if validator exists with this wallet
      const checkResponse = await fetch(`http://localhost:4000/api/auth/validator-info/${address}`);
      const checkData = await checkResponse.json();
      
      if (checkResponse.ok && checkData.validator) {
        setValidatorInfo(checkData.validator);
        setStep('confirm');
      } else {
        throw new Error('No validator account found with this wallet. Please register first.');
      }
      
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const loginValidator = async () => {
    setIsLoggingIn(true);
    
    try {
      // Load bs58 library
      const bs58Module = await loadBs58();
      
      // Create message to sign for login
      const message = `Validator login for ${walletAddress} at ${Date.now()}`;
      
      // Request signature from wallet
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
      const signature = bs58Module.default.encode(signedMessage.signature);
      
      // Submit login to backend
      const response = await fetch('http://localhost:4000/api/auth/validator-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: walletAddress,
          message: message,
          signature: signature
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Validator logged in successfully');
        
        // Store auth data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setStep('complete');
        
        // Redirect to validator marketplace after 1 second
        setTimeout(() => {
          navigate('/validator');
        }, 1000);
        
      } else {
        throw new Error(data.error || 'Login failed');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Back to Home */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="text-purple-400 hover:text-purple-300 flex items-center transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {step === 'connect' && 'Validator Login'}
              {step === 'confirm' && 'Confirm Login'}
              {step === 'complete' && 'Welcome Back!'}
            </h1>
            <p className="text-gray-300">
              {step === 'connect' && 'Connect your wallet to access the marketplace'}
              {step === 'confirm' && 'Sign the message to securely log in'}
              {step === 'complete' && 'Login successful! Redirecting...'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Wallet Connection */}
          {step === 'connect' && (
            <div className="space-y-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="text-blue-400 mr-3">🔒</span>
                  Secure wallet-based authentication
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="text-blue-400 mr-3">📱</span>
                  No passwords needed
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="text-blue-400 mr-3">⚡</span>
                  Quick access to marketplace
                </div>
              </div>

              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Connecting Wallet...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🔐</span>
                    Connect Phantom Wallet
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Confirm Login */}
          {step === 'confirm' && validatorInfo && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-medium mb-2">Validator Account Found</h3>
                <p className="text-gray-300 text-sm mb-1">Name: {validatorInfo.name}</p>
                <p className="text-gray-400 text-xs">Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}</p>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  Please sign the message in your wallet to complete the secure login process.
                </p>
              </div>

              <button
                onClick={loginValidator}
                disabled={isLoggingIn}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoggingIn ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✍️</span>
                    Sign Message & Login
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setStep('connect');
                  setWalletAddress('');
                  setValidatorInfo(null);
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                ← Use Different Wallet
              </button>
            </div>
          )}

          {/* Step 3: Login Complete */}
          {step === 'complete' && validatorInfo && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">✓</span>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Welcome back, {validatorInfo.name}!</h3>
                <p className="text-gray-300 text-sm">Login successful</p>
              </div>

              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <p className="text-green-200 text-sm">
                  🚀 Ready to start monitoring websites and earning SOL!
                </p>
              </div>

              <div className="flex items-center justify-center text-gray-400 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Redirecting to marketplace...
              </div>
            </div>
          )}

          {/* Register Link */}
          {step === 'connect' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Don't have a validator account?{' '}
                <Link 
                  to="/validator-register" 
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Register here
                </Link>
              </p>
            </div>
          )}

          {/* Phantom Wallet Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have Phantom wallet?{' '}
              <a 
                href="https://phantom.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                Download here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ValidatorLoginPage; 