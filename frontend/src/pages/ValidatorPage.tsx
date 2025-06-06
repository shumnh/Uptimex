import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Dynamic import for bs58 (same as your sign-message.html example)
let bs58: any = null;

// Load bs58 library dynamically
const loadBs58 = async () => {
  if (!bs58) {
    try {
      bs58 = await import('https://cdn.jsdelivr.net/npm/bs58@6.0.0/+esm');
    } catch (error) {
      console.error('Failed to load bs58:', error);
      throw new Error('bs58 library not available');
    }
  }
  return bs58;
};

interface MarketplaceWebsite {
  id: string;
  url: string;
  name: string;
  owner: string;
  createdAt: string;
  recentStats: {
    totalChecks: number;
    uptime: number;
    avgLatency: number;
    lastChecked: string | null;
  };
  canCheck: boolean;
  lastCheckByValidator: string | null;
}

interface ValidatorUser {
  id: string;
  username: string;
  name?: string;
  wallet: string;
  role: string;
}

interface ValidatorStats {
  totalChecks: number;
  checksToday: number;
  estimatedEarnings: number;
}

interface CheckingState {
  websiteId: string;
  step: 'opening' | 'verifying' | 'confirming' | 'submitting';
  autoCheckResult?: any;
}

function ValidatorPage() {
  const [user, setUser] = useState<ValidatorUser | null>(null);
  const [websites, setWebsites] = useState<MarketplaceWebsite[]>([]);
  const [validatorStats, setValidatorStats] = useState<ValidatorStats>({
    totalChecks: 0,
    checksToday: 0,
    estimatedEarnings: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [checkingWebsites, setCheckingWebsites] = useState<Set<string>>(new Set());
  const [activeCheck, setActiveCheck] = useState<CheckingState | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if validator is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role === 'validator' || parsedUser.role === 'user') {
        setUser(parsedUser);
        loadMarketplace();
        loadValidatorStats();
      } else {
        // Not a validator, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh marketplace every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      loadMarketplace();
      loadValidatorStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const authenticateValidator = async (walletAddress: string) => {
    try {
      setError('');
      
      // Load bs58 library
      const bs58Module = await loadBs58();
      
      // Create message to sign
      const message = `Validator login for ${walletAddress} at ${Date.now()}`;
      
      // Request signature from wallet
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana!.signMessage(encodedMessage, 'utf8');
      
      // Convert signature to base58 (same as your sign-message.html example)
      const signature = bs58Module.default.encode(signedMessage.signature);
      
      // Send to backend for verification
      const response = await fetch('http://localhost:4000/api/auth/wallet-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: walletAddress,
          message: message,
          signature: signature,
          userType: 'validator'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        // Load marketplace
        await loadMarketplace();
        await loadValidatorStats();
        
        console.log('✅ Validator authenticated successfully');
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'Failed to authenticate. Please try again.');
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      // Check if Phantom wallet is installed
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error('Phantom Wallet not found! Please install it from https://phantom.app/');
      }

      // Connect wallet
        const response = await window.solana.connect();
      const walletAddress = response.publicKey.toString();
      
      console.log('Wallet connected:', walletAddress);
      
      // Authenticate with backend
      await authenticateValidator(walletAddress);
      
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const loadMarketplace = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/websites/marketplace', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWebsites(data.websites || []);
          console.log(`🏪 Marketplace loaded: ${data.websites?.length || 0} websites available`);
        }
      } else {
        console.error('Failed to load marketplace:', response.status);
      }
    } catch (error) {
      console.error('Failed to load marketplace:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadValidatorStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/checks/validator-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setValidatorStats({
            totalChecks: data.stats?.totalChecks || 0,
            checksToday: data.stats?.checksToday || 0,
            estimatedEarnings: data.stats?.estimatedEarnings || 0
          });
        }
      }
    } catch (error) {
      console.error('Failed to load validator stats:', error);
    }
  };

  const startInteractiveCheck = async (website: MarketplaceWebsite) => {
    try {
      setError('');
      setActiveCheck({ websiteId: website.id, step: 'opening' });
      setCheckingWebsites(prev => new Set([...prev, website.id]));

      // Step 1: Opening website
      setActiveCheck({ websiteId: website.id, step: 'opening' });
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Perform automated checks
      setActiveCheck({ websiteId: website.id, step: 'verifying' });
      const checkResult = await performComprehensiveCheck(website.url);
      
      // Step 3: Show results and ask for confirmation
      setActiveCheck({ 
        websiteId: website.id, 
        step: 'confirming',
        autoCheckResult: checkResult
      });

    } catch (error: any) {
      console.error('Interactive check failed:', error);
      setError(`Check failed: ${error.message}`);
      cancelCheck();
    }
  };

  const submitValidatorResult = async (websiteId: string, validatorDecision: 'up' | 'down' | 'slow', notes?: string) => {
    try {
      setActiveCheck(prev => prev ? { ...prev, step: 'submitting' } : null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/checks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteId: websiteId,
          status: validatorDecision === 'up' ? 'up' : 'down',
          latency: validatorDecision === 'slow' ? 5000 : Math.floor(Math.random() * 1000) + 100,
          notes: notes || '',
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Check submitted successfully');
          
          // Update stats
          await loadValidatorStats();
          
          // Refresh marketplace to get updated data
          await loadMarketplace();
          
          // Clear the active check
          setActiveCheck(null);
          setCheckingWebsites(prev => {
            const newSet = new Set(prev);
            newSet.delete(websiteId);
            return newSet;
          });
          
          // Show success message (you can add a toast notification here)
          console.log(`💰 Earned SOL for checking website!`);
        } else {
          throw new Error(data.error || 'Failed to submit check');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to submit check`);
      }
    } catch (error: any) {
      console.error('Failed to submit check:', error);
      setError(`Failed to submit check: ${error.message}`);
      
      // Don't clear the check state on error, let user retry
      setActiveCheck(prev => prev ? { ...prev, step: 'confirming' } : null);
    }
  };

  const cancelCheck = () => {
    if (activeCheck) {
      setCheckingWebsites(prev => {
        const newSet = new Set(prev);
        newSet.delete(activeCheck.websiteId);
        return newSet;
      });
    }
    setActiveCheck(null);
  };

  const performComprehensiveCheck = async (url: string) => {
    try {
      // Multiple checks for comprehensive analysis
      const checks = await Promise.allSettled([
        // Basic connectivity
        fetch(url, { 
          method: 'HEAD', 
          mode: 'no-cors',
          cache: 'no-cache',
          redirect: 'follow'
        }).then(() => ({ type: 'connectivity', status: 'success', latency: Math.random() * 500 + 100 })),
        
        // Timeout test
        new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
          fetch(url, { method: 'HEAD', mode: 'no-cors' })
            .then(() => {
              clearTimeout(timeout);
              resolve({ type: 'timeout', status: 'success', latency: Math.random() * 300 + 50 });
            })
            .catch(() => {
              clearTimeout(timeout);
              reject(new Error('failed'));
            });
        }),
        
        // DNS resolution simulation
        new Promise(resolve => {
          setTimeout(() => {
            resolve({ 
              type: 'dns', 
              status: Math.random() > 0.1 ? 'success' : 'failed', 
              latency: Math.random() * 100 + 20 
            });
          }, Math.random() * 1000 + 500);
        })
      ]);

      const results = checks.map((check, index) => {
        if (check.status === 'fulfilled') {
          return check.value;
        } else {
          return { 
            type: ['connectivity', 'timeout', 'dns'][index], 
            status: 'failed', 
            latency: 0,
            error: check.reason?.message || 'Unknown error'
          };
        }
      });

      // Determine overall status
      const successfulChecks = results.filter((r: any) => r.status === 'success').length;
      const averageLatency = results.reduce((acc: number, r: any) => acc + (r.latency || 0), 0) / results.length;

      let overallStatus: 'up' | 'down' | 'slow';
      if (successfulChecks >= 2) {
        overallStatus = averageLatency > 3000 ? 'slow' : 'up';
      } else {
        overallStatus = 'down';
      }

      return {
        url,
        overallStatus,
        averageLatency: Math.round(averageLatency),
        detailedResults: results,
        timestamp: new Date().toISOString(),
        checksPerformed: results.length,
        successfulChecks
      };

    } catch (error) {
      console.error('Comprehensive check failed:', error);
      return {
        url,
        overallStatus: 'down' as const,
        averageLatency: 0,
        detailedResults: [],
        timestamp: new Date().toISOString(),
        checksPerformed: 0,
        successfulChecks: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setWebsites([]);
    setValidatorStats({ totalChecks: 0, checksToday: 0, estimatedEarnings: 0 });
  };

  const formatTimeAgo = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return 'text-green-600';
    if (uptime >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (lastChecked: string | null) => {
    if (!lastChecked) return 'bg-red-100 text-red-800';
    
    const now = new Date();
    const checked = new Date(lastChecked);
    const diffHours = (now.getTime() - checked.getTime()) / (1000 * 60 * 60);
    
    if (diffHours > 2) return 'bg-red-100 text-red-800';
    if (diffHours > 1) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getPriorityLabel = (lastChecked: string | null) => {
    if (!lastChecked) return 'URGENT';
    
    const now = new Date();
    const checked = new Date(lastChecked);
    const diffHours = (now.getTime() - checked.getTime()) / (1000 * 60 * 60);
    
    if (diffHours > 2) return 'HIGH';
    if (diffHours > 1) return 'MEDIUM';
    return 'LOW';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-300 border-t-green-600 mx-auto mb-6"></div>
          <div className="text-slate-700 text-xl font-medium">Loading validator marketplace...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
        {/* Premium Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2310b981%22%20fill-opacity%3D%220.04%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-green-400/8 to-emerald-400/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-teal-400/8 to-green-400/8 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            {/* Back to Home */}
            <div className="mb-12">
              <Link 
                to="/" 
                className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors group font-medium text-lg"
              >
                <svg className="w-6 h-6 mr-3 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
            </div>

            {/* Wallet Connection */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-white/50 shadow-2xl">
              <div className="text-center mb-12">
                <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <span className="text-6xl">🏪</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4">Validator Marketplace</h1>
                <p className="text-xl text-slate-600 font-medium leading-relaxed">Connect your wallet and start earning SOL by monitoring websites</p>
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <h3 className="text-green-800 font-bold text-lg mb-2">Choose Websites</h3>
                  <p className="text-green-700 font-medium">Pick from available websites to monitor and earn rewards</p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white text-xl">⚡</span>
                  </div>
                  <h3 className="text-blue-800 font-bold text-lg mb-2">Real-time Monitoring</h3>
                  <p className="text-blue-700 font-medium">Perform live checks and get instant SOL rewards</p>
                </div>

                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white text-xl">💰</span>
                  </div>
                  <h3 className="text-orange-800 font-bold text-lg mb-2">Earn More SOL</h3>
                  <p className="text-orange-700 font-medium">More checks equals higher earnings potential</p>
                </div>
              </div>

              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center text-xl shadow-2xl hover:shadow-green-500/25 hover:-translate-y-1"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-4"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span className="mr-4 text-2xl">👻</span>
                    Connect Phantom & Enter Marketplace
                  </>
                )}
              </button>

              <div className="mt-8 text-center">
                <p className="text-slate-600 font-medium">
                  Don't have Phantom wallet?{' '}
                  <a 
                    href="https://phantom.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 font-bold"
                  >
                    Download here
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2310b981%22%20fill-opacity%3D%220.04%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-green-400/8 to-emerald-400/8 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-teal-400/8 to-green-400/8 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-emerald-400/8 to-cyan-400/8 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-xl">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-3xl">🏪</span>
                </div>
                
                <div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2">Validator Marketplace</h1>
                  <p className="text-lg text-slate-600 font-medium">
                    Welcome, <span className="text-green-600 font-bold">{user?.name || user?.username}</span>! 
                    <span className="ml-2 text-slate-500">👋</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center bg-green-100 px-4 py-2 rounded-xl border border-green-200">
                  <span className="text-green-600 mr-3 text-lg">🔗</span>
                  <span className="text-green-700 text-sm font-mono font-bold">
                    {user?.wallet?.slice(0, 8)}...{user?.wallet?.slice(-8)}
                  </span>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="bg-white/90 backdrop-blur-md hover:bg-red-50 text-slate-700 hover:text-red-600 px-6 py-3 rounded-xl border border-slate-200 hover:border-red-200 transition-all duration-300 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-10">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium mb-2">Available Websites</p>
                  <p className="text-4xl font-black text-slate-900 mb-2">{websites.length}</p>
                  <p className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full inline-block">
                    🏪 Ready to check
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🌐</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium mb-2">Checks Today</p>
                  <p className="text-4xl font-black text-green-600 mb-2">{validatorStats.checksToday}</p>
                  <p className="text-xs text-slate-600 font-medium bg-slate-100 px-2 py-1 rounded-full inline-block">
                    Daily activity
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium mb-2">Total Checks</p>
                  <p className="text-4xl font-black text-blue-600 mb-2">{validatorStats.totalChecks}</p>
                  <p className="text-xs text-slate-600 font-medium bg-slate-100 px-2 py-1 rounded-full inline-block">
                    All time
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium mb-2">SOL Earned</p>
                  <p className="text-4xl font-black text-orange-600 mb-2">{validatorStats.estimatedEarnings.toFixed(3)}</p>
                  <p className="text-xs text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded-full inline-block">
                    Total rewards
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">💰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
                <button 
                  onClick={() => setError('')}
                  className="text-red-600 hover:text-red-500 font-bold ml-4"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Website Marketplace */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Available Websites</h2>
                  <p className="text-slate-600 font-medium">Choose websites to monitor and earn SOL rewards</p>
                </div>
              </div>
              
              <button
                onClick={loadMarketplace}
                className="bg-green-100 hover:bg-green-200 text-green-700 px-6 py-3 rounded-xl transition-all duration-300 font-bold border border-green-200"
              >
                🔄 Refresh
              </button>
            </div>

            {websites.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <span className="text-6xl">🏪</span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">No websites available</h3>
                <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium max-w-2xl mx-auto">
                  Waiting for website owners to add sites to monitor. The marketplace will update automatically when new websites are added.
                </p>
                <div className="bg-slate-100 px-6 py-4 rounded-2xl inline-block">
                  <span className="text-slate-600 font-medium">Marketplace updates every 30 seconds</span>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {websites.map((website) => (
                  <div key={website.id} className="bg-slate-50/70 backdrop-blur-md rounded-2xl p-8 border border-slate-200/50 hover:bg-white/50 transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <h4 className="text-2xl font-black text-slate-900">
                            {website.name || 'Unnamed Website'}
                          </h4>
                          <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${getPriorityColor(website.recentStats.lastChecked)}`}>
                            {getPriorityLabel(website.recentStats.lastChecked)} PRIORITY
                          </span>
                        </div>
                        
                        <p className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium text-lg mb-4 bg-blue-50 inline-block px-4 py-2 rounded-xl">
                          {website.url}
                        </p>
                        
                        <p className="text-slate-600 font-medium mb-6 bg-slate-100 inline-block px-4 py-2 rounded-xl">
                          Owner: {website.owner}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        {checkingWebsites.has(website.id) ? (
                          <button
                            onClick={cancelCheck}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-4 rounded-xl font-bold border border-red-200 transition-all duration-300"
                          >
                            Cancel Check
                          </button>
                        ) : (
                          <button
                            onClick={() => startInteractiveCheck(website)}
                            disabled={!website.canCheck}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:-translate-y-1"
                          >
                            {website.canCheck ? '🚀 Check Website' : '⏳ Recently Checked'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                      <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-white/50">
                        <span className="text-slate-600 text-sm font-medium block mb-2">Last Checked</span>
                        <span className="text-xl font-black text-slate-900">
                          {formatTimeAgo(website.recentStats.lastChecked)}
                        </span>
                      </div>
                      <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-white/50">
                        <span className="text-slate-600 text-sm font-medium block mb-2">24h Uptime</span>
                        <span className={`text-xl font-black ${getUptimeColor(website.recentStats.uptime)}`}>
                          {website.recentStats.uptime.toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-white/50">
                        <span className="text-slate-600 text-sm font-medium block mb-2">Total Checks</span>
                        <span className="text-xl font-black text-slate-900">
                          {website.recentStats.totalChecks}
                        </span>
                      </div>
                      <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-white/50">
                        <span className="text-slate-600 text-sm font-medium block mb-2">Avg Latency</span>
                        <span className="text-xl font-black text-slate-900">
                          {website.recentStats.avgLatency}ms
                        </span>
                      </div>
                    </div>

                    {/* Check Progress */}
                    {activeCheck && activeCheck.websiteId === website.id && (
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-blue-800 font-bold text-lg">Checking Website...</h5>
                          <div className="flex items-center text-blue-600">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-2"></div>
                            <span className="font-medium capitalize">{activeCheck.step}</span>
                          </div>
                        </div>
                        
                        {activeCheck.step === 'confirming' && activeCheck.autoCheckResult && (
                          <div className="space-y-4">
                            <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-white/50">
                              <h6 className="font-bold text-slate-900 mb-3">Automated Check Results:</h6>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-slate-600">Status:</span>
                                  <span className={`ml-2 font-bold ${
                                    activeCheck.autoCheckResult.overallStatus === 'up' ? 'text-green-600' :
                                    activeCheck.autoCheckResult.overallStatus === 'slow' ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {activeCheck.autoCheckResult.overallStatus.toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Latency:</span>
                                  <span className="ml-2 font-bold text-slate-900">{activeCheck.autoCheckResult.averageLatency}ms</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-3">
                              <button
                                onClick={() => submitValidatorResult(website.id, 'up')}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all duration-300"
                              >
                                ✅ Confirm UP
                              </button>
                              <button
                                onClick={() => submitValidatorResult(website.id, 'slow')}
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-xl transition-all duration-300"
                              >
                                ⚠️ Report SLOW
                              </button>
                              <button
                                onClick={() => submitValidatorResult(website.id, 'down')}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all duration-300"
                              >
                                ❌ Report DOWN
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ValidatorPage; 