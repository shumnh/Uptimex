import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect(): Promise<{ publicKey: { toString(): string } }>;
      disconnect(): Promise<void>;
      isConnected: boolean;
      publicKey?: { toString(): string };
    };
  }
}

function RegisterPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError('');

      if (typeof window === 'undefined') {
        throw new Error('Window object not available');
      }

      if (!window.solana) {
        throw new Error('Phantom wallet not found. Please install Phantom wallet extension from https://phantom.app/');
      }

      if (!window.solana.isPhantom) {
        throw new Error('Please use Phantom wallet extension');
      }

      console.log('Connecting wallet...');
      const response = await window.solana.connect();
      
      if (!response || !response.publicKey) {
        throw new Error('Failed to get wallet public key');
      }
      
      const address = response.publicKey.toString();
      console.log('Wallet connected:', address);
      
      setWalletAddress(address);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRegistration = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setIsRegistering(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `user_${walletAddress.slice(-8)}_${Date.now()}`,
          email: email || `${walletAddress.toLowerCase()}@wallet.local`,
          password: 'WalletAuth123!', // Placeholder password for backend compatibility
          role: 'user',
          solanaWallet: walletAddress
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        // Handle registration failure
        if (data.message?.includes('Wallet address already registered') || data.error?.includes('Wallet address already registered')) {
          setError('This wallet is already registered. Please use the login page instead.');
        } else {
          setError(data.message || data.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Back Button */}
          <Link 
            to="/"
            className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"
          >
            <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span>
            Back to Home
          </Link>

          {/* Main Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔗</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Join Our Platform
              </h1>
              <p className="text-gray-300">
                Connect your Solana wallet to start monitoring websites
              </p>
              <div className="mt-4 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                <p className="text-blue-200 text-sm font-semibold">
                  🌟 Fully Decentralized • Web3 Native • No Passwords
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
                <p className="text-red-200 text-sm">{error}</p>
                {(error.includes('already registered') || error.includes('Wallet address already registered')) && (
                  <Link
                    to="/wallet-connect"
                    className="mt-3 inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center text-sm transition-colors"
                  >
                    Go to Wallet Login
                  </Link>
                )}
              </div>
            )}

            <div className="space-y-6">
              {/* Step 1: Connect Wallet */}
              <div className="space-y-4">
                <div className="flex items-center text-gray-300 text-sm">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-3 text-white text-xs font-bold">
                    1
                  </div>
                  <span>Connect Your Solana Wallet</span>
                </div>
                
                {!walletAddress ? (
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <span className="text-2xl mr-3">👻</span>
                        Connect Phantom Wallet
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <div>
                        <p className="text-green-200 text-sm font-semibold">Wallet Connected</p>
                        <p className="text-green-200/80 text-xs font-mono">
                          {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Optional Email */}
              {walletAddress && (
                <div className="space-y-4">
                  <div className="flex items-center text-gray-300 text-sm">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 text-white text-xs font-bold">
                      2
                    </div>
                    <span>Email for Notifications (Optional)</span>
                  </div>
                  
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="your.email@example.com (optional)"
                    />
                    <p className="text-gray-400 text-xs mt-2">
                      📧 Get uptime alerts, security notifications, and platform updates
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Terms and Register */}
              {walletAddress && (
                <div className="space-y-4">
                  <div className="flex items-center text-gray-300 text-sm">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 text-white text-xs font-bold">
                      3
                    </div>
                    <span>Complete Registration</span>
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 bg-white/10 border border-white/20 rounded focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <label htmlFor="acceptTerms" className="ml-3 text-gray-300 text-sm">
                      I agree to the{' '}
                      <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  <button
                    onClick={handleRegistration}
                    disabled={isRegistering || !acceptTerms}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isRegistering ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <span className="text-xl mr-2">🚀</span>
                        Start Monitoring
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Wallet Detection Status */}
            <div className="mt-8 bg-gray-500/10 border border-gray-500/20 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">?</span>
                </div>
                <div>
                  <h3 className="text-gray-200 font-semibold text-sm mb-1">Wallet Status</h3>
                  <p className="text-gray-200/80 text-xs leading-relaxed">
                    {typeof window !== 'undefined' && window.solana ? (
                      window.solana.isPhantom ? (
                        <span className="text-green-400">✅ Phantom wallet detected</span>
                      ) : (
                        <span className="text-yellow-400">⚠️ Solana wallet found but not Phantom</span>
                      )
                    ) : (
                      <span className="text-red-400">❌ No Solana wallet detected</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">i</span>
                </div>
                <div>
                  <h3 className="text-blue-200 font-semibold text-sm mb-1">New to Phantom?</h3>
                  <p className="text-blue-200/80 text-xs leading-relaxed">
                    Phantom is a secure Solana wallet. 
                    <a 
                      href="https://phantom.app/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-200 ml-1"
                    >
                      Download it here
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Already have account */}
            <div className="text-center pt-6 border-t border-white/10 mt-6">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link to="/wallet-connect" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Connect Wallet
                </Link>
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-center">
                <div className="text-green-400 text-2xl mb-2">🔒</div>
                <div className="text-white text-sm font-semibold mb-1">Secure</div>
                <div className="text-gray-400 text-xs">Your keys, your control</div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-center">
                <div className="text-blue-400 text-2xl mb-2">⚡</div>
                <div className="text-white text-sm font-semibold mb-1">Fast</div>
                <div className="text-gray-400 text-xs">Instant connection</div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-center">
                <div className="text-purple-400 text-2xl mb-2">🌐</div>
                <div className="text-white text-sm font-semibold mb-1">Web3</div>
                <div className="text-gray-400 text-xs">Fully decentralized</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage; 