import { Link } from 'react-router-dom';

function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%236366f1%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

      <div className="relative z-10">
        {/* Premium Navigation */}
        <nav className="absolute top-0 w-full z-20 p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">Uptimex</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">How it Works</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Pricing</a>
              <Link 
                to="/login" 
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 pt-20">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-md border border-indigo-200/50 rounded-full text-sm font-medium text-indigo-700 mb-8 shadow-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                Web3-Native Monitoring Platform
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Decentralized
                </span>
                <br />
                Website Monitoring
              </h1>
              
              <p className="text-xl lg:text-2xl text-slate-600 mb-12 max-w-2xl leading-relaxed font-medium">
                Trust verified by blockchain. Monitoring powered by a global network of independent validators earning real SOL rewards.
              </p>

            {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-16">
              <Link 
                to="/register"
                  className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                  <span className="relative z-10 flex items-center justify-center">
                    Start Monitoring
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
                
              <Link 
                  to="/validator-register"
                  className="group px-8 py-4 bg-white/80 backdrop-blur-md text-slate-900 font-bold rounded-2xl border-2 border-indigo-200 hover:border-indigo-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                  <span className="flex items-center justify-center">
                    Earn as Validator
                    <span className="ml-2 text-green-600 font-black">+ SOL</span>
                  </span>
              </Link>
            </div>

            {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-black text-slate-900 mb-2">99.9%</div>
                  <div className="text-slate-500 text-sm font-medium uppercase tracking-wide">Accuracy</div>
                </div>
              <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-black text-slate-900 mb-2">24/7</div>
                  <div className="text-slate-500 text-sm font-medium uppercase tracking-wide">Monitoring</div>
              </div>
              <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-black text-slate-900 mb-2">Global</div>
                  <div className="text-slate-500 text-sm font-medium uppercase tracking-wide">Network</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative bg-white/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
                {/* Mock Dashboard */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Live Dashboard</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-slate-600">Real-time</span>
                    </div>
                  </div>
                  
                  {/* Mock Website Cards */}
                  {[
                    { name: 'E-commerce Site', status: 'up', uptime: '99.8%', latency: '142ms' },
                    { name: 'API Service', status: 'up', uptime: '100%', latency: '89ms' },
                    { name: 'Landing Page', status: 'up', uptime: '99.9%', latency: '67ms' }
                  ].map((site, index) => (
                    <div key={index} className="bg-white/60 backdrop-blur-md rounded-xl p-4 border border-white/50 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-semibold text-slate-900">{site.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">{site.uptime}</div>
                          <div className="text-xs text-slate-500">{site.latency}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center pt-4">
                    <div className="text-2xl font-black text-slate-900">3 Validators Active</div>
                    <div className="text-sm text-slate-500">Earning 0.003 SOL/check</div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl rotate-12 opacity-80 shadow-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl -rotate-12 opacity-80 shadow-xl"></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6 bg-white/30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                Two Paths to 
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Success</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
                Whether you're monitoring websites or validating uptime, our platform offers premium experiences for both.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Website Owners Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-10 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="text-center mb-10">
                    <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4">Website Owners</h3>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      Professional monitoring with global validator network verification and real-time analytics.
                    </p>
                  </div>

                  <div className="space-y-4 mb-10">
                    {[
                      'Real-time uptime monitoring',
                      'Global validator verification',
                      'Premium analytics dashboard',
                      'Instant SOL-based notifications',
                      'Enterprise-grade reliability'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center text-slate-700">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg">
                          <svg className="w-3 h-3 text-white font-bold" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="text-center text-sm font-bold text-indigo-700 mb-6 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-2xl">
                      🚀 Professional Web3 Monitoring • Wallet-Only Authentication
                    </div>
                    
                      <Link 
                        to="/wallet-connect"
                      className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl text-center shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Connect Wallet
                      </span>
                      </Link>
                    
                    <Link 
                      to="/register"
                      className="block w-full bg-white/80 backdrop-blur-md text-slate-900 font-bold py-3 px-6 rounded-2xl text-center border-2 border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Create Account
                    </Link>
                    
                    <div className="text-xs text-slate-500 text-center font-medium">
                      🔐 Secure • Decentralized • No Passwords Required
                    </div>
                  </div>
                </div>
              </div>

              {/* Validators Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-10 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="text-center mb-10">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4">Validators</h3>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      Earn real SOL rewards by providing website monitoring services in our decentralized marketplace.
                    </p>
                  </div>

                  <div className="space-y-4 mb-10">
                    {[
                      'Earn SOL for every verification',
                      'Choose your own monitoring work',
                      'Instant blockchain payments',
                      'Global earning opportunities',
                      'Professional validator tools'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center text-slate-700">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg">
                          <svg className="w-3 h-3 text-white font-bold" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="text-center text-sm font-bold text-purple-700 mb-6 px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl">
                      💰 Earn Real SOL • Choose Your Work • Start Immediately
                    </div>
                    
                    <Link 
                      to="/validator-register"
                      className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-2xl text-center shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Start Earning Now
                      </span>
                    </Link>
                    
                    <Link 
                      to="/validator-login"
                      className="block w-full bg-white/80 backdrop-blur-md text-slate-900 font-bold py-3 px-6 rounded-2xl text-center border-2 border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Already Registered? Login
                    </Link>
                    
                    <div className="text-xs text-slate-500 text-center font-medium">
                      🔐 Wallet Authentication • Instant SOL Payments
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                How It 
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Works</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
                A decentralized monitoring ecosystem where trust is verified by blockchain technology.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
              {[
                {
                  step: '01',
                  title: 'Website Registration',
                  description: 'Connect your wallet and add websites to monitor with custom reward settings.',
                  icon: '🌐',
                  gradient: 'from-blue-500 to-cyan-500'
                },
                {
                  step: '02', 
                  title: 'Validator Network',
                  description: 'Global validators choose and verify your website uptime earning SOL rewards.',
                  icon: '👥',
                  gradient: 'from-purple-500 to-pink-500'
                },
                {
                  step: '03',
                  title: 'Real-time Results',
                  description: 'Get instant notifications and detailed analytics powered by blockchain verification.',
                  icon: '📊',
                  gradient: 'from-green-500 to-emerald-500'
                }
              ].map((item, index) => (
                <div key={index} className="text-center group">
                  <div className={`w-20 h-20 bg-gradient-to-r ${item.gradient} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  <div className="text-sm font-black text-slate-400 mb-4 tracking-widest">{item.step}</div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 px-6 bg-slate-900">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">U</span>
              </div>
              <span className="text-3xl font-black text-white tracking-tight">Uptimex</span>
            </div>
            <p className="text-slate-400 font-medium mb-8 max-w-2xl mx-auto">
              The future of website monitoring is decentralized. Join the revolution.
            </p>
            <div className="text-slate-500 text-sm font-medium">
              © 2025 Uptimex. Built with 💜 for the Web3 community.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default HomePage; 