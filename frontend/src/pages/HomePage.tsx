import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="absolute top-0 w-full z-20 p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-white font-bold text-xl">
              🚀 Solana Uptime Validator
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Decentralized
                </span>
                <br />
                Website Monitoring
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Trust verified by blockchain. Monitoring powered by a global network of independent validators.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                to="/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="relative z-10">Start Monitoring</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link 
                to="/validator"
                className="group px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
              >
                Become a Validator
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
                <div className="text-gray-400 text-sm">Global Validators</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">99.9%</div>
                <div className="text-gray-400 text-sm">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-gray-400 text-sm">Monitoring</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Choose Your Path
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Multiple ways to access our decentralized monitoring platform.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Website Owners Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">🏢</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Website Owners</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Monitor your websites with multiple independent validators around the world
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {[
                      'Real-time uptime monitoring',
                      'Multiple validator verification', 
                      'Detailed performance analytics',
                      'Instant wallet notifications',
                      'Decentralized Web3 platform'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center text-gray-300">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="text-center text-sm text-purple-200 mb-4 px-3 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg">
                      🌟 Fully Web3 Native • Wallet-Only Authentication
                    </div>
                    
                    <Link 
                      to="/wallet-connect"
                      className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl text-center hover:shadow-lg transition-all duration-300"
                    >
                      <span className="text-xl mr-2">🔗</span>
                      Connect Wallet
                    </Link>
                    
                    <Link 
                      to="/register"
                      className="block w-full bg-white/10 backdrop-blur-md text-white font-semibold py-3 px-6 rounded-xl text-center border border-white/20 hover:bg-white/20 transition-all duration-300"
                    >
                      Create New Account
                    </Link>
                    
                    <div className="text-xs text-gray-400 text-center">
                      🔐 Secure • Decentralized • No Passwords
                    </div>
                  </div>
                </div>
              </div>

              {/* Validators Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">👥</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Validators</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Earn rewards by checking website uptime and providing verification services
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {[
                      'Earn crypto rewards',
                      'Automatic work assignments',
                      'Blockchain-verified payments',
                      'Global work opportunities',
                      'Wallet-only authentication'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center text-gray-300">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="text-center text-sm text-purple-200 mb-4 px-3 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg">
                      💰 Earn SOL • Choose Your Work • No KYC Required
                    </div>
                    
                    <Link 
                      to="/validator-register"
                      className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl text-center hover:shadow-lg transition-all duration-300"
                    >
                      <span className="text-xl mr-2">🚀</span>
                      Start Earning as Validator
                    </Link>
                    
                    <Link 
                      to="/validator-login"
                      className="block w-full bg-white/10 backdrop-blur-md text-white font-semibold py-3 px-6 rounded-xl text-center border border-white/20 hover:bg-white/20 transition-all duration-300"
                    >
                      Already Registered? Login
                    </Link>
                    
                    <div className="text-xs text-gray-400 text-center">
                      🔐 Wallet Authentication • Instant Payments
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Simple, transparent, and trustworthy website monitoring powered by blockchain technology.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🌐",
                  title: "Add Your Website",
                  description: "Register your website and configure monitoring settings in just minutes."
                },
                {
                  icon: "👥", 
                  title: "Validators Check",
                  description: "Multiple independent validators around the world check your site every 5 minutes."
                },
                {
                  icon: "📊",
                  title: "Get Reports",
                  description: "Receive real-time reports with cryptographic proof of uptime status."
                }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                    <span className="text-4xl">{step.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-gray-400 mb-4">
              © 2024 Solana Uptime Validator. Powered by blockchain technology.
            </div>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default HomePage; 