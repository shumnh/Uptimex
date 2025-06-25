import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bs58 from 'bs58';
import API_ENDPOINTS from '../config/api';

interface RegistrationStep {
  id: number;
  title: string;
  description: string;
}

const steps: RegistrationStep[] = [
  {
    id: 1,
    title: "Enter Your Name",
    description: "Tell us what to call you on the platform"
  },
  {
    id: 2,
    title: "Connect Wallet",
    description: "Link your Solana wallet for authentication"
  },
  {
    id: 3,
    title: "Complete Setup",
    description: "Finish your validator registration"
  }
];

function ValidatorRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setCurrentStep(2);
      setError('');
    } else {
      setError('Please enter your name');
    }
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError('');

      if (!window.solana || !window.solana.isPhantom) {
        throw new Error('Phantom wallet not found. Please install Phantom wallet extension.');
      }

      const response = await window.solana.connect();
      const address = response.publicKey.toString();
      
      setWalletAddress(address);
      setCurrentStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRegistration = async () => {
    try {
      setIsRegistering(true);
      setError('');

      // Create message to sign
      const message = `Validator registration for ${name} with wallet ${walletAddress} at ${Date.now()}`;
      
      // Request signature from wallet
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana!.signMessage(encodedMessage, 'utf8');
      
      // Convert signature to base58
      const signature = bs58.encode(signedMessage.signature);

      const response = await fetch(API_ENDPOINTS.AUTH.VALIDATOR_REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          wallet: walletAddress,
          message: message,
          signature: signature
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/validator');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                What should we call you?
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Choose a name that other validators and website owners will see
              </p>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-base font-semibold text-slate-900 mb-3">
                  Your Validator Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name or pseudonym"
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-base"
                  required
                />
                <p className="text-slate-500 text-xs mt-2">
                  This can be your real name, username, or any identifier you prefer
                </p>
              </div>

              <button
                type="submit"
                className="group relative w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="relative z-10 flex items-center justify-center text-lg">
                  Continue to Wallet Connection
                  <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <span className="text-2xl">👻</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Connect Your Wallet
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Link your Solana wallet to authenticate your validator identity
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-green-800 font-semibold text-base">Hello, {name}! 👋</span>
              </div>
              <p className="text-green-700 text-sm">
                Now let's connect your Phantom wallet to secure your validator account and enable reward payments.
              </p>
            </div>

            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="group relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-105"
            >
              <span className="relative z-10 flex items-center justify-center text-lg">
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
                    Connecting Wallet...
                  </>
                ) : (
                  <>
                    <span className="text-3xl mr-4">👻</span>
                    Connect Phantom Wallet
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/50">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-slate-900 font-semibold text-base mb-2">Secure Identity</h3>
                <p className="text-slate-600 text-sm">Your wallet serves as your unique validator identity on the network.</p>
              </div>

              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/50">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-slate-900 font-semibold text-base mb-2">Earn SOL</h3>
                <p className="text-slate-600 text-sm">Receive SOL rewards directly to your wallet for monitoring websites.</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4">
                Complete Your Setup
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                You're all set! Let's finalize your validator registration
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-bold">Validator Name:</span>
                  <span className="text-green-700 font-medium">{name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-bold">Wallet Address:</span>
                  <span className="text-green-700 font-mono text-sm bg-green-100 px-3 py-1 rounded-lg">
                    {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-bold">Role:</span>
                  <span className="text-green-700 font-medium">Website Validator</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-blue-800 font-semibold mb-2">Secure Registration</h3>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    When you click "Become a Validator", you'll be asked to sign a message with your wallet to prove ownership. This is completely secure and doesn't cost any SOL.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRegistration}
              disabled={isRegistering}
              className="group relative w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold py-6 px-8 rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-105"
            >
              <span className="relative z-10 flex items-center justify-center text-xl">
                {isRegistering ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
                    Creating Validator Account...
                  </>
                ) : (
                  <>
                    <span className="text-2xl mr-4">🚀</span>
                    Become a Validator
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-green-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        );

      default:
        return null;
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-8 py-6">
        <div className="max-w-7xl w-full">
          {/* Navigation */}
          <div className="flex justify-between items-center mb-6">
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
                to="/validator-login"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                Validator Login
              </Link>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Information */}
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-200 rounded-full mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-green-700 text-sm font-bold">Validator Registration</span>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 leading-tight">
                  Become a
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> Validator</span>
                </h1>
                
                <p className="text-lg text-slate-600 leading-relaxed font-medium mb-6">
                  Join our decentralized network of validators and earn SOL rewards by monitoring websites around the clock. Make the internet more reliable.
                </p>
              </div>

              {/* Validator Benefits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-semibold text-base mb-2">Earn SOL Rewards</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Get paid in SOL tokens for every website check you perform. Passive income through validation.</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-semibold text-base mb-2">Automated Process</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Our system automatically assigns website checks to you. No manual work required.</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-semibold text-base mb-2">High Reputation</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Build your validator reputation and earn more assignments as you prove reliability.</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-semibold text-base mb-2">Global Network</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Join validators worldwide in creating the most reliable website monitoring network.</p>
                </div>
              </div>

              {/* Earnings Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-green-700 font-semibold text-base">Earning Potential</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600 mb-1">0.01 SOL</div>
                    <div className="text-green-700 text-xs">Per Website Check</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600 mb-1">100+</div>
                    <div className="text-green-700 text-xs">Checks Per Day</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600 mb-1">1+ SOL</div>
                    <div className="text-green-700 text-xs">Daily Potential</div>
                  </div>
                </div>
                <p className="text-green-700 text-xs text-center mt-3">
                  * Earnings depend on validator reputation and network activity
                </p>
              </div>
            </div>

            {/* Right Side - Registration Steps */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-2xl">
              {/* Progress Steps */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-4">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          currentStep >= step.id
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {step.id}
                      </div>
                      {step.id < steps.length && (
                        <div
                          className={`w-16 h-1 mx-2 transition-all duration-300 ${
                            currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Step Content */}
              {renderStepContent()}

              {/* Navigation Buttons */}
              {currentStep > 1 && currentStep < 3 && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Go Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ValidatorRegisterPage; 