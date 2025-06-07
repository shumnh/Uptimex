import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '../config/api';



function WalletConnectPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const checkUserExists = async (address: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.USER_INFO(address));
      const data = await response.json();
      return response.ok && data.exists;
    } catch (error) {
      return false;
    }
  };

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

      // First check if user exists
      const userExists = await checkUserExists(walletAddress);
      
      if (!userExists) {
        setError('No account found for this wallet. Please register first.');
        return;
      }

      // User exists, proceed with login
      const authResponse = await fetch(API_ENDPOINTS.AUTH.WALLET_LOGIN, {
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
        setError(data.error || data.message || 'Failed to authenticate with wallet');
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-slate-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse animation-delay-3000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-8 py-12">
        <div className="max-w-6xl w-full">
          {/* Navigation */}
          <div className="flex justify-between items-center mb-12">
          <Link 
            to="/"
              className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors group text-lg"
          >
              <svg className="w-6 h-6 mr-3 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            Back to Home
          </Link>

            <div className="flex space-x-4">
              <Link
                to="/register"
                className="px-6 py-3 bg-white/70 backdrop-blur-md text-slate-700 rounded-xl hover:bg-white/90 transition-all duration-300 border border-white/50"
              >
                Website Owner
              </Link>
              <Link
                to="/validator-register"
                className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Become Validator
              </Link>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Information */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-slate-100 border border-slate-200 rounded-full mb-6">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-slate-700 text-sm font-semibold">Premium Web3 Platform</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                  Connect Your
                  <span className="bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent"> Wallet</span>
                </h1>
                
                <p className="text-xl text-slate-600 leading-relaxed mb-8">
                  Access your website monitoring dashboard with your Solana wallet. 
                  Secure, instant, and completely decentralized.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-bold text-lg mb-2">Secure Authentication</h3>
                  <p className="text-slate-600 text-sm">No passwords, no data breaches. Your wallet is your identity.</p>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-bold text-lg mb-2">Lightning Fast</h3>
                  <p className="text-slate-600 text-sm">Connect instantly and start monitoring your websites.</p>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-bold text-lg mb-2">Fully Decentralized</h3>
                  <p className="text-slate-600 text-sm">Built on Solana blockchain for maximum transparency.</p>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-bold text-lg mb-2">Earn Rewards</h3>
                  <p className="text-slate-600 text-sm">Get paid in crypto for monitoring websites as a validator.</p>
                </div>
              </div>
            </div>

            {/* Right Side - Wallet Connection */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 border border-white/60 shadow-2xl">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-r from-slate-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-3xl">🔗</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Website Owner Login
                </h2>
                <p className="text-slate-600 text-lg">
                  Connect your wallet to access your monitoring dashboard
              </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-red-800 font-medium">{error}</p>
                {error.includes('No account found') && (
                        <Link
                          to="/register"
                          className="mt-4 inline-block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl text-center transition-all duration-300 hover:shadow-lg"
                  >
                    Create Account with Wallet
                        </Link>
                )}
                    </div>
                  </div>
              </div>
            )}

              <div className="space-y-8">
              {/* Phantom Wallet Connect */}
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                  className="group relative w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold py-6 px-8 rounded-2xl shadow-2xl hover:shadow-slate-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-105"
              >
                  <span className="relative z-10 flex items-center justify-center text-xl">
                {isConnecting ? (
                  <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                        <span className="text-3xl mr-4">👻</span>
                    Connect Phantom Wallet
                  </>
                )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

                {/* Wallet Status */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white text-sm font-bold">?</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-slate-800 font-semibold mb-2">Wallet Status</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {typeof window !== 'undefined' && window.solana ? (
                          window.solana.isPhantom ? (
                            <span className="text-emerald-600 font-medium">✅ Phantom wallet detected and ready</span>
                          ) : (
                            <span className="text-amber-600 font-medium">⚠️ Solana wallet found but not Phantom</span>
                          )
                        ) : (
                          <span className="text-red-600 font-medium">❌ No Solana wallet detected</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-blue-800 font-semibold mb-2">New to Phantom?</h3>
                      <p className="text-blue-700 text-sm leading-relaxed mb-3">
                        Phantom is a secure Solana wallet that stores your digital assets and allows you to interact with Web3 applications.
                      </p>
                      <a 
                        href="https://phantom.app/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-700 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        Download Phantom Wallet
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                  </div>
                  </div>
                </div>
              </div>

              {/* Alternative Options */}
              <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm mb-4">Don't have an account?</p>
                  <Link
                    to="/register"
                  className="inline-flex items-center text-slate-600 hover:text-slate-800 font-medium transition-colors"
                  >
                  Create new account
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default WalletConnectPage; 