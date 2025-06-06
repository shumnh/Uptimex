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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%236366f1%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
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
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                Join Uptimex
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                Connect your Solana wallet to start monitoring websites with our decentralized platform
              </p>
              <div className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-purple-700 text-sm font-bold">
                  Fully Decentralized • Web3 Native • No Passwords
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
                <div className="flex items-center text-slate-700 font-medium">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-4 text-white text-sm font-bold shadow-lg">
                    1
                  </div>
                  <span className="text-lg">Connect Your Solana Wallet</span>
                </div>
                
                {!walletAddress ? (
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="group relative w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-5 px-8 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {isConnecting ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          Connecting Wallet...
                        </>
                      ) : (
                        <>
                          <span className="text-3xl mr-3">👻</span>
                          <span className="text-lg">Connect Phantom Wallet</span>
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                ) : (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-green-800 font-bold text-lg">Wallet Connected</p>
                        <p className="text-green-600 font-mono text-sm mt-1">
                          {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Optional Email */}
              {walletAddress && (
                <div className="space-y-6">
                  <div className="flex items-center text-slate-700 font-medium">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-4 text-white text-sm font-bold shadow-lg">
                      2
                    </div>
                    <span className="text-lg">Email (Optional)</span>
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-6 py-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 font-medium"
                    />
                    <p className="text-slate-500 text-sm font-medium">
                      Optional: Receive important notifications via email
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Terms & Create Account */}
              {walletAddress && (
                <div className="space-y-6">
                  <div className="flex items-center text-slate-700 font-medium">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center mr-4 text-white text-sm font-bold shadow-lg">
                      3
                    </div>
                    <span className="text-lg">Complete Registration</span>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-1 mr-4 w-5 h-5 text-purple-600 bg-white border-slate-300 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <div className="text-slate-700 text-sm leading-relaxed">
                        <span className="font-medium">I agree to the </span>
                        <a href="#" className="text-purple-600 font-bold hover:text-purple-700 underline">
                          Terms of Service
                        </a>
                        <span className="font-medium"> and </span>
                        <a href="#" className="text-purple-600 font-bold hover:text-purple-700 underline">
                          Privacy Policy
                        </a>
                        <span className="font-medium">. I understand this is a decentralized platform and I'm responsible for my wallet security.</span>
                      </div>
                    </label>
                  </div>

                  <button
                    onClick={handleRegistration}
                    disabled={isRegistering || !acceptTerms}
                    className="group relative w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold py-5 px-8 rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {isRegistering ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          Creating Your Account...
                        </>
                      ) : (
                        <>
                          <span className="text-2xl mr-3">🚀</span>
                          <span className="text-lg">Create Account</span>
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-green-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              )}

              {/* Features Preview */}
              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-lg font-bold text-slate-900 text-center mb-6">
                  What you'll get with your account:
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { icon: '🏗️', title: 'Website Monitoring', desc: 'Add unlimited websites to monitor' },
                    { icon: '📈', title: 'Real-time Analytics', desc: 'Detailed uptime and performance metrics' },
                    { icon: '🔔', title: 'Instant Notifications', desc: 'Get alerted immediately when issues occur' },
                    { icon: '🌍', title: 'Global Validation', desc: 'Verified by our worldwide validator network' },
                    { icon: '💰', title: 'SOL Rewards System', desc: 'Pay validators with SOL tokens' }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-2xl mr-4">{feature.icon}</span>
                      <div>
                        <h4 className="font-bold text-slate-900">{feature.title}</h4>
                        <p className="text-slate-600 text-sm">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Actions */}
              <div className="text-center border-t border-slate-200 pt-8">
                <p className="text-slate-600 mb-4 font-medium">
                  Already have an account?
                </p>
                <Link 
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-300"
                >
                  Sign In Instead
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