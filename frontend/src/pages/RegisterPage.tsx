import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';



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
      const response = await fetch('https://uptimex-188w.onrender.com/api/auth/register', {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%236366f1%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-8 py-12">
        <div className="max-w-7xl w-full">
          {/* Navigation */}
          <div className="flex justify-between items-center mb-12">
          <Link 
            to="/"
              className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors group font-medium text-lg"
          >
              <svg className="w-6 h-6 mr-3 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            Back to Home
          </Link>

            <div className="flex space-x-4">
              <Link
                to="/wallet-connect"
                className="px-6 py-3 bg-white/70 backdrop-blur-md text-slate-700 rounded-xl hover:bg-white/90 transition-all duration-300 border border-white/50 font-medium"
              >
                Already have account?
              </Link>
              <Link
                to="/validator-register"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                Become Validator
              </Link>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Side - Information */}
            <div className="space-y-10">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-purple-100 border border-purple-200 rounded-full mb-8">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-purple-700 text-sm font-bold">Website Owner Registration</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 leading-tight">
                  Monitor Your
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Websites</span>
                </h1>
                
                <p className="text-2xl text-slate-600 leading-relaxed font-medium mb-10">
                  Join the most advanced decentralized website monitoring platform. 
                  Get instant alerts, detailed analytics, and 99.9% uptime tracking.
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-black text-xl mb-3">24/7 Monitoring</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">Continuous website monitoring with instant notifications when your site goes down.</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-black text-xl mb-3">Lightning Fast</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">Get alerts within seconds of any downtime or performance issues.</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-black text-xl mb-3">Fully Decentralized</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">Built on Solana blockchain for transparency and reliability.</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-black text-xl mb-3">Detailed Analytics</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">Comprehensive reports on uptime, response times, and performance metrics.</p>
                </div>
              </div>

              {/* Testimonial or Stats */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-3xl p-8">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-4 animate-pulse"></div>
                  <span className="text-purple-700 font-black text-lg">Join 1000+ Website Owners</span>
                </div>
                <p className="text-slate-700 font-medium text-lg leading-relaxed">
                  "Since switching to this decentralized monitoring platform, we've reduced our downtime by 90% and gained complete transparency into our website performance."
                </p>
                <div className="mt-6 flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">JD</span>
                  </div>
                  <div>
                    <div className="text-slate-900 font-bold">John Doe</div>
                    <div className="text-slate-600 text-sm">CTO, TechCorp</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-white/60 shadow-2xl">
              <div className="text-center mb-12">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                  Create Account
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed font-medium">
                  Connect your Solana wallet to get started with website monitoring
                </p>
                  </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-red-800 font-medium">{error}</p>
                      {(error.includes('already registered') || error.includes('Wallet address already registered')) && (
                        <Link
                          to="/wallet-connect"
                          className="mt-4 inline-block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                        >
                          Go to Login
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-8">
                {/* Step 1: Connect Wallet */}
                <div className="space-y-6">
                  <div className="flex items-center text-slate-700 font-bold text-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-4 text-white text-sm font-bold shadow-lg">
                      1
                    </div>
                    <span>Connect Your Solana Wallet</span>
                  </div>
                  
                  {!walletAddress ? (
                    <button
                      onClick={connectWallet}
                      disabled={isConnecting}
                      className="group relative w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-6 px-8 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-105"
                    >
                      <span className="relative z-10 flex items-center justify-center text-xl">
                        {isConnecting ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
                            Connecting Wallet...
                          </>
                        ) : (
                          <>
                            <span className="text-4xl mr-4">👻</span>
                      Connect Phantom Wallet
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  ) : (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-green-800 font-bold text-lg mb-1">Wallet Connected! ✨</div>
                          <div className="text-green-700 text-sm font-mono bg-green-100 px-3 py-1 rounded-lg">
                            {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2: Optional Email */}
                {walletAddress && (
                  <div className="space-y-6">
                    <div className="flex items-center text-slate-700 font-bold text-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-4 text-white text-sm font-bold shadow-lg">
                        2
                      </div>
                      <span>Email for Notifications (Optional)</span>
                    </div>
                    
                  <div>
                    <input
                      type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full px-6 py-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 font-medium text-lg"
                    />
                      <p className="text-slate-500 text-sm mt-3 font-medium">
                        We'll send you alerts when your websites go down (you can skip this)
                    </p>
                    </div>
                  </div>
              )}

                {/* Step 3: Terms and Register */}
                {walletAddress && (
                  <div className="space-y-6">
                    <div className="flex items-center text-slate-700 font-bold text-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center mr-4 text-white text-sm font-bold shadow-lg">
                        3
                      </div>
                      <span>Accept Terms & Complete</span>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                          id="terms"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="mt-1 mr-4 w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                        <label htmlFor="terms" className="text-slate-700 font-medium leading-relaxed">
                  I agree to the{' '}
                          <a href="#" className="text-purple-600 hover:text-purple-700 font-bold underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                          <a href="#" className="text-purple-600 hover:text-purple-700 font-bold underline">
                    Privacy Policy
                  </a>
                          . I understand this is a Web3 platform and I'm responsible for my wallet security.
                </label>
                      </div>
              </div>

              <button
                      onClick={handleRegistration}
                      disabled={isRegistering || !acceptTerms}
                      className="group relative w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-6 px-8 rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-105"
                    >
                      <span className="relative z-10 flex items-center justify-center text-xl">
                        {isRegistering ? (
                  <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
                    Creating Account...
                  </>
                ) : (
                          <>
                            <span className="text-2xl mr-4">🚀</span>
                            Create My Account
                          </>
                )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
                  </div>
                )}
              </div>

              {/* Alternative Options */}
              <div className="mt-10 text-center">
                <p className="text-slate-500 text-sm mb-4">Already have an account?</p>
                <Link
                  to="/wallet-connect"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-bold transition-colors text-lg"
                >
                  Login with wallet
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

export default RegisterPage; 