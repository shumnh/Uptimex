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

function ValidatorRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'wallet' | 'complete'>('form');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    setError('');
    setStep('wallet');
  };

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
      
      // Proceed to registration
      await registerValidator(address);
      
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const registerValidator = async (address: string) => {
    setIsRegistering(true);
    
    try {
      // Load bs58 library
      const bs58Module = await loadBs58();
      
      // Create message to sign for registration
      const message = `Validator registration for ${address} at ${Date.now()}`;
      
      // Request signature from wallet
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
      const signature = bs58Module.default.encode(signedMessage.signature);
      
      // Submit registration to backend
      const response = await fetch('http://localhost:4000/api/auth/validator-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          wallet: address,
          message: message,
          signature: signature
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Validator registered successfully');
        
        // Store auth data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setStep('complete');
        
        // Redirect to validator marketplace after 2 seconds
        setTimeout(() => {
          navigate('/validator');
        }, 2000);
        
      } else {
        throw new Error(data.error || 'Registration failed');
      }
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsRegistering(false);
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
            <div className="text-6xl mb-4">👥</div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {step === 'form' && 'Join as Validator'}
              {step === 'wallet' && 'Connect Wallet'}
              {step === 'complete' && 'Welcome!'}
            </h1>
            <p className="text-gray-300">
              {step === 'form' && 'Start earning SOL by monitoring websites'}
              {step === 'wallet' && 'Connect your Phantom wallet to secure your account'}
              {step === 'complete' && 'Registration complete! Redirecting to marketplace...'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Name and Email Form */}
          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Validator Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your name or validator alias"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="your@email.com (for notifications)"
                />
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="text-green-400 mr-3">✓</span>
                  Earn SOL rewards for monitoring websites
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="text-green-400 mr-3">✓</span>
                  Choose which websites to verify
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="text-green-400 mr-3">✓</span>
                  Secure wallet-based authentication
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Continue to Wallet Connection
              </button>
            </form>
          )}

          {/* Step 2: Wallet Connection */}
          {step === 'wallet' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-medium mb-2">Registration Details</h3>
                <p className="text-gray-300 text-sm">Name: {formData.name}</p>
                {formData.email && <p className="text-gray-300 text-sm">Email: {formData.email}</p>}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="text-green-400 mr-3">✓</span>
                  Your wallet will be your secure login
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="text-green-400 mr-3">✓</span>
                  Cryptographic signatures verify your identity
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="text-green-400 mr-3">✓</span>
                  Earnings paid directly to your wallet
                </div>
              </div>

              <button
                onClick={connectWallet}
                disabled={isConnecting || isRegistering}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Connecting Wallet...
                  </>
                ) : isRegistering ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Registering Validator...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🔐</span>
                    Connect Phantom Wallet
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('form')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                ← Back to Form
              </button>
            </div>
          )}

          {/* Step 3: Registration Complete */}
          {step === 'complete' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">✓</span>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Welcome, {formData.name}!</h3>
                <p className="text-gray-300 text-sm mb-1">Your validator account has been created</p>
                <p className="text-gray-400 text-xs">Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}</p>
              </div>

              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <p className="text-green-200 text-sm">
                  🎉 You're now ready to start earning SOL by monitoring websites!
                </p>
              </div>

              <div className="flex items-center justify-center text-gray-400 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Redirecting to marketplace...
              </div>
            </div>
          )}

          {/* Login Link */}
          {step === 'form' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already registered?{' '}
                <Link 
                  to="/validator-login" 
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Login here
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

export default ValidatorRegisterPage; 