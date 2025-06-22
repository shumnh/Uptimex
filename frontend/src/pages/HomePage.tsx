import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-mono">
      {/* Terminal Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2300ff00%22%20fill-opacity%3D%220.03%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221%22%20height%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60"></div>
      
      {/* Terminal Scanlines */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-pulse"></div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-green-500/20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500/20 animate-pulse"></div>
      </div>

      <div className="relative z-10">
        {/* Terminal Navigation */}
        <nav className="absolute top-0 w-full z-20 p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-900/50 border border-green-500/50 rounded flex items-center justify-center">
                <span className="text-green-400 font-mono font-bold text-lg">U</span>
              </div>
              <span className="text-2xl font-bold text-green-400 font-mono tracking-tight">
                <span className="text-green-500">$</span> uptimex.sh
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <span className="text-green-400 font-mono text-sm hover:text-green-300 transition-colors cursor-pointer">
                ./features --list
              </span>
              <span className="text-green-400 font-mono text-sm hover:text-green-300 transition-colors cursor-pointer">
                ./docs --help
              </span>
            </div>
          </div>
        </nav>

        {/* Terminal Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 pt-20">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Terminal Content */}
            <div className="text-center lg:text-left">
              <div className="bg-gray-900/80 border border-green-500/30 rounded-lg p-4 mb-8 backdrop-blur-sm">
                <div className="text-green-400 font-mono text-sm">
                  <span className="text-green-500">$</span> systemctl status uptimex-monitor
                  <br />
                  <span className="text-green-300">●</span> uptimex-monitor.service - Decentralized Website Monitoring
                  <br />
                  <span className="text-green-300 ml-2">Loaded:</span> loaded (/etc/systemd/system/uptimex.service; enabled)
                  <br />
                  <span className="text-green-300 ml-2">Active:</span> <span className="text-green-400 animate-pulse">active (running)</span> since 2024
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-green-400 mb-8 leading-tight font-mono">
                <span className="text-green-500">&gt;</span> DECENTRALIZED
                <br />
                <span className="text-green-300 ml-6">WEBSITE_MONITOR</span>
              </h1>
              
              <div className="text-lg lg:text-xl text-green-300 mb-12 max-w-2xl leading-relaxed font-mono">
                <span className="text-green-500">[INFO]</span> Blockchain-verified monitoring
                <br />
                <span className="text-green-500">[INFO]</span> Global validator network earning SOL
                <br />
                <span className="text-green-500">[INFO]</span> Trustless uptime verification
              </div>

              {/* Terminal CTA Buttons */}
              <div className="space-y-4 mb-16">
                <div className="text-green-400 font-mono text-sm mb-4">
                  <span className="text-green-500">$</span> ./init_user.sh --select-role:
                </div>
                
                <Link 
                  to="/register"
                  className="block w-full bg-green-900/30 border border-green-500 text-green-400 font-mono py-3 px-6 rounded hover:bg-green-900/50 transition-all duration-300 mb-2"
                >
                  <span className="text-green-500">[1]</span> ./website_owner.sh --start-monitoring
                </Link>
                
                <Link 
                  to="/validator-register"
                  className="block w-full bg-blue-900/30 border border-blue-500 text-blue-400 font-mono py-3 px-6 rounded hover:bg-blue-900/50 transition-all duration-300"
                >
                  <span className="text-blue-500">[2]</span> ./validator.sh --earn-sol
                </Link>
              </div>

              {/* Terminal Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900/50 border border-green-500/30 rounded p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 font-mono">99.9%</div>
                  <div className="text-green-500 text-xs font-mono uppercase tracking-wide">ACCURACY</div>
                </div>
                <div className="bg-gray-900/50 border border-green-500/30 rounded p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 font-mono">24/7</div>
                  <div className="text-green-500 text-xs font-mono uppercase tracking-wide">UPTIME</div>
                </div>
                <div className="bg-gray-900/50 border border-green-500/30 rounded p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 font-mono">GLOBAL</div>
                  <div className="text-green-500 text-xs font-mono uppercase tracking-wide">NETWORK</div>
                </div>
              </div>
            </div>

            {/* Right Column - Terminal Dashboard */}
            <div className="relative">
              <div className="bg-gray-900 border border-green-500/30 rounded-lg shadow-2xl shadow-green-500/20">
                {/* Terminal Header */}
                <div className="bg-gray-800 px-4 py-3 rounded-t-lg border-b border-green-500/30 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-green-400 font-mono text-sm">uptimex@dashboard:~/live</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="text-green-400 font-mono text-sm mb-4">
                    <span className="text-green-500">$</span> ./monitor.sh --show-status --live
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-green-300 font-mono text-xs mb-4">
                      [INFO] Live monitoring dashboard - Real-time updates
                    </div>
                    
                    {/* Mock Terminal Website Status */}
                    {[
                      { name: 'ecommerce-site.com', status: 'UP', uptime: '99.8%', latency: '142ms', checks: '847' },
                      { name: 'api-service.dev', status: 'UP', uptime: '100%', latency: '89ms', checks: '1203' },
                      { name: 'landing-page.io', status: 'UP', uptime: '99.9%', latency: '67ms', checks: '592' }
                    ].map((site, index) => (
                      <div key={index} className="bg-black/50 border border-green-500/20 rounded p-3 font-mono text-xs">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-500 animate-pulse">●</span>
                            <span className="text-green-400">{site.name}</span>
                          </div>
                          <div className="text-green-300">[{site.status}]</div>
                        </div>
                        <div className="mt-1 text-green-500 text-xs">
                          uptime: {site.uptime} | latency: {site.latency} | checks: {site.checks}
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-green-500/30 pt-4 mt-4">
                      <div className="text-green-400 font-mono text-sm">
                        <span className="text-green-500">$</span> validator_network --status
                      </div>
                      <div className="text-green-300 text-xs mt-2">
                        [INFO] 3 validators active | earning 0.003 SOL/check
                      </div>
                      <div className="text-green-300 text-xs">
                        [INFO] Next payout in 47 minutes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Terminal Features Section */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="text-green-400 font-mono mb-4">
                <span className="text-green-500">$</span> ./features.sh --list-all
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-green-400 mb-6 font-mono">
                <span className="text-green-500">&gt;</span> TWO_USER_TYPES
              </h2>
              <div className="text-lg text-green-300 max-w-3xl mx-auto font-mono">
                <span className="text-green-500">[INFO]</span> Dual-mode platform for monitoring and validation
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Website Owners Terminal */}
              <div className="bg-gray-900 border border-green-500/30 rounded-lg shadow-2xl shadow-green-500/20">
                <div className="bg-gray-800 px-4 py-3 rounded-t-lg border-b border-green-500/30 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-green-400 font-mono text-sm">website-owners@uptimex</span>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="text-green-400 font-mono mb-6">
                    <span className="text-green-500">$</span> ./role_info.sh --website-owners
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-green-400 font-mono mb-4">WEBSITE_OWNERS</h3>
                    <p className="text-green-300 font-mono text-sm leading-relaxed">
                      Professional monitoring with blockchain verification
                    </p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {[
                      'Real-time uptime monitoring',
                      'Global validator verification', 
                      'Premium analytics dashboard',
                      'SOL-based instant alerts',
                      'Enterprise-grade reliability'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center text-green-300 font-mono text-sm">
                        <span className="text-green-500 mr-3">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="bg-green-900/20 border border-green-500/30 rounded px-4 py-2 text-center">
                      <div className="text-green-400 font-mono text-xs">
                        [INFO] Multiple authentication methods available
                      </div>
                    </div>
                    
                    <Link 
                      to="/wallet-connect"
                      className="block w-full bg-green-900/30 border border-green-500 text-green-400 font-mono py-2 px-4 rounded hover:bg-green-900/50 transition-all duration-300 text-sm"
                    >
                      <span className="text-green-500">$</span> ./wallet_auth.sh --phantom
                    </Link>

                    <Link 
                      to="/email-login"
                      className="block w-full bg-gray-800/50 border border-gray-600 text-gray-300 font-mono py-2 px-4 rounded hover:bg-gray-800 transition-all duration-300 text-sm"
                    >
                      <span className="text-gray-500">$</span> ./email_auth.sh --traditional
                    </Link>
                    
                    <div className="text-green-300 font-mono text-xs text-center mt-4">
                      New user? <Link to="/email-register" className="text-green-400 hover:text-green-300">./register.sh</Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Validators Terminal */}
              <div className="bg-gray-900 border border-blue-500/30 rounded-lg shadow-2xl shadow-blue-500/20">
                <div className="bg-gray-800 px-4 py-3 rounded-t-lg border-b border-blue-500/30 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-blue-400 font-mono text-sm">validators@uptimex</span>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="text-blue-400 font-mono mb-6">
                    <span className="text-blue-500">$</span> ./role_info.sh --validators
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-blue-400 font-mono mb-4">VALIDATORS</h3>
                    <p className="text-blue-300 font-mono text-sm leading-relaxed">
                      Earn SOL by validating website uptime globally
                    </p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {[
                      'Earn SOL for each validation',
                      'Automated monitoring tasks',
                      'Global network participation',
                      'Real-time payout tracking',
                      'Reputation-based rewards'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center text-blue-300 font-mono text-sm">
                        <span className="text-blue-500 mr-3">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded px-4 py-2 text-center">
                      <div className="text-blue-400 font-mono text-xs">
                        [INFO] Multiple authentication methods available
                      </div>
                    </div>
                    
                    <Link 
                      to="/validator-register"
                      className="block w-full bg-blue-900/30 border border-blue-500 text-blue-400 font-mono py-2 px-4 rounded hover:bg-blue-900/50 transition-all duration-300 text-sm"
                    >
                      <span className="text-blue-500">$</span> ./wallet_auth.sh --phantom
                    </Link>

                    <Link 
                      to="/validator-email-login"
                      className="block w-full bg-gray-800/50 border border-gray-600 text-gray-300 font-mono py-2 px-4 rounded hover:bg-gray-800 transition-all duration-300 text-sm"
                    >
                      <span className="text-gray-500">$</span> ./email_auth.sh --traditional
                    </Link>
                    
                    <div className="text-blue-300 font-mono text-xs text-center mt-4">
                      New validator? <Link to="/validator-email-register" className="text-blue-400 hover:text-blue-300">./register.sh</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Terminal Footer */}
        <footer className="border-t border-green-500/30 bg-gray-900/50 py-12">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="text-green-400 font-mono mb-4">
              <span className="text-green-500">$</span> ./about.sh --version
            </div>
            <div className="text-green-300 font-mono text-sm">
              Uptimex v1.0.0 - Decentralized Website Monitoring Platform
              <br />
              Built on Solana • Powered by Global Validators • Verified by Blockchain
            </div>
            <div className="text-green-500 font-mono text-xs mt-4">
              [INFO] System operational • All services running • Network healthy
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default HomePage; 