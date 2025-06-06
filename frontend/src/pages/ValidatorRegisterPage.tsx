import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

      const response = await fetch('http://localhost:4000/api/auth/validator-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          wallet: walletAddress
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
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">
                What should we call you?
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                Choose a name that other validators and website owners will see
              </p>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-lg font-bold text-slate-900 mb-3">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name or pseudonym"
                  className="w-full px-6 py-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 font-medium text-lg"
                  required
                />
                <p className="text-slate-500 text-sm mt-2 font-medium">
                  This can be your real name, username, or any identifier you prefer
                </p>
              </div>

              <button
                type="submit"
                className="group relative w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="relative z-10 flex items-center justify-center text-lg">
                  Continue
                  <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <span className="text-4xl">👻</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                Link your Solana wallet to authenticate your validator identity
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-green-800 font-bold">Hello, {name}! 👋</span>
              </div>
              <p className="text-green-700 font-medium">
                Now let's connect your Phantom wallet to secure your validator account.
              </p>
            </div>

            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="group relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-5 px-8 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-105"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    <span className="text-lg">Connecting Wallet...</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl mr-3">👻</span>
                    <span className="text-lg">Connect Phantom Wallet</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <div className="flex items-center justify-center">
              <button
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Name
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">
                You're All Set!
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                Complete your validator registration and start earning SOL
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-green-800 mb-4">Registration Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-medium">Name:</span>
                    <span className="text-green-800 font-bold">{name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-medium">Wallet:</span>
                    <span className="text-green-800 font-mono text-sm">
                      {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-medium">Role:</span>
                    <span className="text-green-800 font-bold">Validator</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-blue-800 mb-4">What's Next?</h3>
                <ul className="space-y-3">
                  {[
                    'Browse available websites to validate',
                    'Earn SOL for each verification you complete',
                    'Build your reputation in the network',
                    'Track your earnings and performance'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-blue-700">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleRegistration}
                disabled={isRegistering}
                className="group relative w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-5 px-8 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isRegistering ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      <span className="text-lg">Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl mr-3">🚀</span>
                      <span className="text-lg">Complete Registration</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <div className="flex items-center justify-center">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Wallet
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%236366f1%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full">
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

          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    currentStep >= step.id 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {currentStep > step.id ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  {step.id < steps.length && (
                    <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-300 ${
                      currentStep > step.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
                Become a Validator
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                {steps.find(s => s.id === currentStep)?.description}
              </p>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-10 border border-white/50 shadow-2xl">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {renderStepContent()}
          </div>

          {/* Benefits Preview */}
          <div className="mt-8 bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/30">
            <h3 className="text-lg font-bold text-slate-900 text-center mb-4">
              Validator Benefits
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '💰', title: 'Earn SOL', desc: 'Get paid for each validation' },
                { icon: '⚡', title: 'Instant Payments', desc: 'Receive rewards immediately' },
                { icon: '🎯', title: 'Choose Sites', desc: 'Pick which websites to monitor' },
                { icon: '📊', title: 'Track Progress', desc: 'See your performance stats' }
              ].map((benefit, index) => (
                <div key={index} className="text-center p-3">
                  <div className="text-2xl mb-2">{benefit.icon}</div>
                  <div className="font-bold text-slate-900 text-sm">{benefit.title}</div>
                  <div className="text-slate-600 text-xs">{benefit.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ValidatorRegisterPage; 