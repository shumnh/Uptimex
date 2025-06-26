import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '../config/api';



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
      // Simple wallet authentication with auto-registration
      const response = await fetch(API_ENDPOINTS.AUTH.WALLET_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          userType: 'user'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col px-8 py-5">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Link 
            to="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors group font-medium"
          >
            <svg className="w-5 h-5 mr-3 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          <div className="flex space-x-4">
            <Link
              to="/wallet-connect"
              className="px-5 py-2.5 bg-white/70 backdrop-blur-md text-slate-700 rounded-lg hover:bg-white/90 transition-all duration-300 border border-white/50 font-medium"
            >
              Login
            </Link>
            <Link
              to="/validator-register"
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
            >
              Validator
            </Link>
          </div>
        </div>

        {/* Main Content - Flex to fill remaining space */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-6xl w-full">
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              {/* Left Side - Information */}
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center px-4 py-2 bg-purple-100 border border-purple-200 rounded-full mb-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-purple-700 text-sm font-semibold">Website Owner Registration</span>
                  </div>
                  
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                    Monitor Your
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Websites</span>
                  </h1>
                  
                  <p className="text-base text-slate-600 leading-relaxed mb-6">
                    Join the most advanced decentralized website monitoring platform. 
                    Get instant alerts, detailed analytics, and 99.9% uptime tracking.
                  </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/50 shadow-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-slate-900 font-semibold text-sm mb-2">24/7 Monitoring</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Continuous monitoring with instant notifications.</p>
                  </div>

                  <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/50 shadow-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7" />
                      </svg>
                    </div>
                    <h3 className="text-slate-900 font-semibold text-sm mb-2">Lightning Fast</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Get alerts within seconds of downtime.</p>
                  </div>

                  <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/50 shadow-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 002 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-slate-900 font-semibold text-sm mb-2">Decentralized</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Built on Solana for transparency.</p>
                  </div>

                  <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/50 shadow-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-slate-900 font-semibold text-sm mb-2">Analytics</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Comprehensive performance reports.</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-purple-700 font-semibold text-sm">Join 1000+ Website Owners</span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    "Reduced downtime by 90% with complete transparency."
                  </p>
                </div>
              </div>

              {/* Right Side - Registration Form */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-xl">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Create Account
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Connect your Solana wallet to get started
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-red-800 font-medium text-sm">{error}</p>
                        {(error.includes('already registered') || error.includes('Wallet address already registered')) && (
                          <Link
                            to="/wallet-connect"
                            className="mt-3 inline-block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-2.5 px-4 rounded-lg text-center transition-all duration-300 text-sm"
                          >
                            Go to Login
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Step 1: Connect Wallet */}
                  <div className="space-y-3">
                    <div className="flex items-center text-slate-700 font-semibold text-base">
                      <div className="w-7 h-7 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-3 text-white text-sm font-bold">
                        1
                      </div>
                      <span>Connect Wallet</span>
                    </div>
                    
                    {!walletAddress ? (
                      <button
                        onClick={connectWallet}
                        disabled={isConnecting}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3.5 px-5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg text-base"
                      >
                        <span className="flex items-center justify-center">
                          {isConnecting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              Connecting...
                            </>
                          ) : (
                            <>
                              <span className="text-xl mr-3">👻</span>
                              Connect Phantom Wallet
                            </>
                          )}
                        </span>
                      </button>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="text-green-800 font-semibold text-sm mb-1">Connected ✨</div>
                            <div className="text-green-700 text-sm font-mono bg-green-100 px-3 py-1 rounded-lg text-center">
                              {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Optional Email */}
                  {walletAddress && (
                    <div className="space-y-3">
                      <div className="flex items-center text-slate-700 font-semibold text-base">
                        <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3 text-white text-sm font-bold">
                          2
                        </div>
                        <span>Email (Optional)</span>
                      </div>
                      
                      <div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        />
                        <p className="text-slate-500 text-sm mt-2">
                          For downtime alerts (optional)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Terms and Register */}
                  {walletAddress && (
                    <div className="space-y-3">
                      <div className="flex items-center text-slate-700 font-semibold text-base">
                        <div className="w-7 h-7 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mr-3 text-white text-sm font-bold">
                          3
                        </div>
                        <span>Accept & Complete</span>
                      </div>
                      
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            id="terms"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="mt-1 mr-3 w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                          />
                          <label htmlFor="terms" className="text-slate-700 text-sm leading-relaxed">
                            I agree to the{' '}
                            <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold underline">
                              Terms
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold underline">
                              Privacy Policy
                            </a>
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={handleRegistration}
                        disabled={isRegistering || !acceptTerms}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3.5 px-5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg text-base"
                      >
                        <span className="flex items-center justify-center">
                          {isRegistering ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              Creating...
                            </>
                          ) : (
                            <>
                              <span className="text-xl mr-3">🚀</span>
                              Create Account
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Alternative Options */}
                <div className="mt-5 text-center">
                  <p className="text-slate-500 text-sm mb-3">Already have an account?</p>
                  <Link
                    to="/wallet-connect"
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold transition-colors text-sm"
                  >
                    Login with wallet
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
    </div>
  );
}

export default RegisterPage; 