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

function WalletConnectPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
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

      console.log('Attempting to connect to wallet...');
      
      const response = await window.solana.connect();
      console.log('Wallet connected:', response);
      
      if (!response || !response.publicKey) {
        throw new Error('Failed to get wallet public key');
      }

      const walletAddress = response.publicKey.toString();
      console.log('Wallet address:', walletAddress);

      // Call backend to authenticate with wallet
      const authResponse = await fetch('http://localhost:4000/api/auth/wallet-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          userType: 'user'
        }),
      });

      const data = await authResponse.json();
      console.log('Auth response:', data);

      if (authResponse.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        if (data.message?.includes('User not found') || data.message?.includes('not found')) {
          setError(`No account found for this wallet. Would you like to create an account?`);
        } else {
          setError(data.message || 'Failed to authenticate with wallet');
        }
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
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
                Connect Your Wallet
              </h1>
              <p className="text-gray-300">
                Access your website monitoring dashboard with your Solana wallet
              </p>
              <div className="mt-4 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg">
                <p className="text-purple-200 text-sm font-semibold">
                  🔐 Secure • Instant • Decentralized
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
                <p className="text-red-200 text-sm">{error}</p>
                {error.includes('No account found') && (
                  <Link
                    to="/register"
                    className="mt-3 inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center text-sm transition-colors"
                  >
                    Create Account with Wallet
                  </Link>
                )}
              </div>
            )}

            <div className="space-y-6">
              {/* Phantom Wallet Connect */}
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

              {/* Info Box */}
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
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

              {/* Wallet Detection Status */}
              <div className="bg-gray-500/20 border border-gray-500/50 rounded-xl p-4">
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

              {/* Create Account */}
              <div className="text-center pt-6 border-t border-white/10">
                <p className="text-gray-400 text-sm mb-4">
                  Don't have an account?
                </p>
                <Link
                  to="/register"
                  className="block w-full bg-white/10 backdrop-blur-md text-white font-semibold py-3 px-6 rounded-xl text-center border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  Create Account with Wallet
                </Link>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-2 gap-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletConnectPage; 