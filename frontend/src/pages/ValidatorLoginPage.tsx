import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bs58 from 'bs58';

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
      
      // Create message to sign
      const message = `Validator login for ${address} at ${Date.now()}`;
      
      // Request signature from wallet
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana!.signMessage(encodedMessage, 'utf8');
      
      // Convert signature to base58
      const signature = bs58.encode(signedMessage.signature);
      
      // Send to backend for verification
      const response = await fetch('https://uptimex-188w.onrender.com/api/auth/validator-login', {
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
      const response = await fetch(`https://uptimex-188w.onrender.com/api/auth/validator-info/${address}`);
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2310b981%22%20fill-opacity%3D%220.04%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-teal-400/10 to-green-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>

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
                to="/register"
                className="px-6 py-3 bg-white/70 backdrop-blur-md text-slate-700 rounded-xl hover:bg-white/90 transition-all duration-300 border border-white/50 font-medium"
              >
                Website Owner
              </Link>
              <Link
                to="/validator-register"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                New Validator
              </Link>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Side - Information */}
            <div className="space-y-10">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-200 rounded-full mb-8">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-green-700 text-sm font-bold">Validator Access Portal</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 leading-tight">
                  Validator
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> Dashboard</span>
                </h1>
                
                <p className="text-2xl text-slate-600 leading-relaxed font-medium mb-10">
                  Access your validator dashboard to monitor assignments, track earnings, and manage your validation activities. Start earning SOL rewards today.
                </p>
              </div>

              {/* Validator Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-black text-xl mb-3">Active Earnings</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">View your current SOL balance and recent validation rewards.</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-black text-xl mb-3">Website Assignments</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">Manage your assigned websites and validation schedules.</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-black text-xl mb-3">Performance Analytics</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">Track your validation accuracy and reputation score.</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.343 12.344l1.414 1.414L9 10.414V17h5v-6.586l3.243 3.243 1.414-1.414L12 5.586l-6.657 6.758z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-black text-xl mb-3">Network Status</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">Monitor network health and validation opportunities.</p>
                </div>
              </div>

              {/* Status Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                  <span className="text-green-700 font-black text-xl">Validator Network Status</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-black text-green-600 mb-2">2,456</div>
                    <div className="text-green-700 font-medium">Active Validators</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-green-600 mb-2">95.8%</div>
                    <div className="text-green-700 font-medium">Network Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-green-600 mb-2">847K</div>
                    <div className="text-green-700 font-medium">Sites Monitored</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-white/60 shadow-2xl">
              <div className="text-center mb-12">
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                  Validator Login
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed font-medium">
                  Connect your registered Solana wallet to access the validator marketplace
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
                      {error.includes('No validator account found') && (
                        <Link
                          to="/validator-register"
                          className="mt-4 inline-block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl text-center transition-all duration-300 hover:shadow-lg"
                        >
                          Register as Validator
                        </Link>
                      )}
                      {error.includes('authenticate') && (
                        <button
                          onClick={retryAuthentication}
                          className="mt-4 inline-block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl text-center transition-all duration-300 hover:shadow-lg"
                        >
                          Retry Authentication
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {validatorInfo && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-green-800 font-bold text-lg">Validator Found! ✨</div>
                      <div className="text-green-700 text-sm">Name: {validatorInfo.name}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-8">
                <button
                  onClick={connectWallet}
                  disabled={isConnecting || isAuthenticating}
                  className="group relative w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold py-6 px-8 rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center justify-center text-xl">
                    {isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
                        Connecting Wallet...
                      </>
                    ) : isAuthenticating ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <span className="text-3xl mr-4">👻</span>
                        Connect Phantom Wallet
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-green-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                {/* Validator Benefits */}
                <div className="space-y-4">
                  <h3 className="text-slate-700 font-bold text-lg text-center mb-6">Validator Benefits</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-2xl mr-4">💰</span>
                      <div>
                        <h4 className="font-bold text-slate-900">Earn SOL Rewards</h4>
                        <p className="text-slate-600 text-sm">Get paid for each website verification</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-2xl mr-4">🎯</span>
                      <div>
                        <h4 className="font-bold text-slate-900">Choose Your Work</h4>
                        <p className="text-slate-600 text-sm">Select which websites to monitor</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-2xl mr-4">⚡</span>
                      <div>
                        <h4 className="font-bold text-slate-900">Instant Payments</h4>
                        <p className="text-slate-600 text-sm">Receive SOL immediately after validation</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-2xl mr-4">📊</span>
                      <div>
                        <h4 className="font-bold text-slate-900">Performance Tracking</h4>
                        <p className="text-slate-600 text-sm">Monitor your earnings and accuracy</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alternative Options */}
              <div className="mt-10 text-center">
                <p className="text-slate-500 text-sm mb-4">Don't have a validator account?</p>
                <Link
                  to="/validator-register"
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-bold transition-colors text-lg"
                >
                  Become a validator
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