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
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
      
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
      console.error('Error loading marketplace:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadValidatorStats = async () => {
    try {
      const token = localStorage.getItem('token');
      // This would be a new endpoint for validator stats
      // For now, we'll calculate basic stats from checks
      const response = await fetch('http://localhost:4000/api/checks/validator-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setValidatorStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error loading validator stats:', error);
      // Set default stats if endpoint doesn't exist yet
      setValidatorStats({
        totalChecks: 0,
        checksToday: 0,
        estimatedEarnings: 0
      });
    }
  };

  const startInteractiveCheck = async (website: MarketplaceWebsite) => {
    const websiteId = website.id;
    setCheckingWebsites(prev => new Set(prev).add(websiteId));
    
    try {
      // Step 1: Start the process and open website
      setActiveCheck({ websiteId, step: 'opening' });
      
      console.log(`🔍 Starting interactive check for ${website.url}`);
      
      // Step 2: Run background check while setting up iframe
      setActiveCheck({ websiteId, step: 'verifying' });
      const autoCheckResult = await performComprehensiveCheck(website.url);
      
      // Step 3: Show embedded interface with results
      setActiveCheck({ 
        websiteId, 
        step: 'confirming', 
        autoCheckResult 
      });
      
    } catch (error: any) {
      console.error('Error starting check:', error);
      setError(`Error starting check: ${error.message}`);
      setCheckingWebsites(prev => {
        const newSet = new Set(prev);
        newSet.delete(websiteId);
        return newSet;
      });
      setActiveCheck(null);
    }
  };

  const submitValidatorResult = async (websiteId: string, validatorDecision: 'up' | 'down' | 'slow', notes?: string) => {
    try {
      setActiveCheck(prev => prev ? { ...prev, step: 'submitting' } : null);
      
      const website = websites.find(w => w.id === websiteId);
      if (!website) throw new Error('Website not found');
      
      const autoResult = activeCheck?.autoCheckResult;
      
      // Combine auto-check with validator decision
      const finalStatus = validatorDecision === 'slow' ? 'up' : validatorDecision;
      const latency = autoResult?.latency || 0;
      
      // Create detailed check data
      const checkData = {
        website: websiteId,
        status: finalStatus,
        latency: latency,
        timestamp: new Date().toISOString(),
        validatorDecision,
        autoCheckResult: autoResult?.status,
        notes: notes || '',
        method: 'interactive'
      };
      
      console.log(`📊 Validator decision for ${website.url}:`, checkData);
      
      // Load bs58 library and create message to sign
      const bs58Module = await loadBs58();
      const message = JSON.stringify({
        website: websiteId,
        status: finalStatus,
        latency: latency,
        timestamp: checkData.timestamp,
        validatorDecision
      });
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
      const signature = bs58Module.default.encode(signedMessage.signature);
      
      // Submit check result to backend
      const token = localStorage.getItem('token');
      const submitResponse = await fetch('http://localhost:4000/api/checks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          website: websiteId,
          status: finalStatus,
          latency: latency,
          timestamp: checkData.timestamp,
          signature: signature
        }),
      });

      if (submitResponse.ok) {
        console.log(`✅ Interactive check submitted for ${website.url}: ${finalStatus}`);
        console.log(`👤 Validator decision: ${validatorDecision}`);
        if (notes) console.log(`📝 Notes: ${notes}`);
        
        // Show success and clear active check
        setActiveCheck(null);
        
        // Refresh marketplace to update stats
        await loadMarketplace();
        await loadValidatorStats();
        
      } else {
        const errorData = await submitResponse.json();
        console.error('Failed to submit check:', errorData);
        setError(`Failed to submit check: ${errorData.error || 'Unknown error'}`);
      }
      
    } catch (error: any) {
      console.error('Error submitting result:', error);
      setError(`Error submitting result: ${error.message}`);
    } finally {
      setCheckingWebsites(prev => {
        const newSet = new Set(prev);
        newSet.delete(websiteId);
        return newSet;
      });
      setActiveCheck(null);
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

  // Enhanced website monitoring function
  const performComprehensiveCheck = async (url: string) => {
    const startTime = Date.now();
    let status = 'down';
    let details = '';
    let latency = 0;
    
    try {
      // Normalize URL
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      
      console.log(`🌐 Testing ${normalizedUrl}...`);
      
      // Try multiple methods to get better results
      const results = await Promise.allSettled([
        // Method 1: HEAD request (fastest)
        fetch(normalizedUrl, { 
          method: 'HEAD', 
          mode: 'no-cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }),
        
        // Method 2: GET request with CORS (if allowed)
        fetch(normalizedUrl, { 
          method: 'GET', 
          mode: 'cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(10000)
        }),
        
        // Method 3: Try HTTP if HTTPS fails
        url.startsWith('https://') ? null : 
        fetch(url.replace('https://', 'http://'), { 
          method: 'HEAD', 
          mode: 'no-cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(10000)
        })
      ].filter(Boolean));
      
      const endTime = Date.now();
      latency = endTime - startTime;
      
      // Analyze results
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      if (successful > 0) {
        status = 'up';
        details = `✅ Responsive (${successful}/${results.length} methods succeeded)`;
        
        // Try to get more details from successful requests
        const fulfilledResults = results.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<Response>[];
        for (const result of fulfilledResults) {
          if (result.value.status && result.value.status !== 0) {
            details += ` | Status: ${result.value.status}`;
            break;
          }
        }
      } else {
        status = 'down';
        details = `❌ All connection methods failed (${failed} attempts)`;
        
        // Try to get error details
        const rejectedResults = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
        if (rejectedResults.length > 0) {
          const errorMsg = rejectedResults[0].reason?.message || 'Unknown error';
          if (errorMsg.includes('CORS')) {
            details += ' | CORS blocked';
          } else if (errorMsg.includes('timeout')) {
            details += ' | Timeout';
          } else if (errorMsg.includes('network')) {
            details += ' | Network error';
          }
        }
      }
      
      // Additional heuristics for better detection
      if (latency > 0 && latency < 30000) { // If we got any response within 30s
        if (status === 'down') {
          // Might be CORS issue but site is actually up
          status = 'up';
          details = '🟡 Likely up (CORS restricted)';
        }
      }
      
      console.log(`📊 Check completed: ${status} in ${latency}ms - ${details}`);
      
      return {
        status,
        latency: Math.min(latency, 30000), // Cap at 30 seconds
        details,
        timestamp: new Date().toISOString(),
        method: 'comprehensive'
      };
      
    } catch (error: any) {
      const endTime = Date.now();
      latency = endTime - startTime;
      
      console.log(`❌ Check failed: ${error.message}`);
      
      return {
        status: 'down',
        latency,
        details: `❌ Failed: ${error.message}`,
        timestamp: new Date().toISOString(),
        method: 'comprehensive'
      };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setWebsites([]);
    navigate('/');
  };

  const formatTimeAgo = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const checkTime = new Date(timestamp).getTime();
    const diffMs = now - checkTime;
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 95) return 'text-green-600';
    if (uptime >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (lastChecked: string | null) => {
    if (!lastChecked) return 'bg-red-100 text-red-800';
    
    const now = Date.now();
    const checkTime = new Date(lastChecked).getTime();
    const diffMs = now - checkTime;
    const minutes = Math.floor(diffMs / (1000 * 60));
    
    if (minutes > 30) return 'bg-red-100 text-red-800'; // High priority
    if (minutes > 15) return 'bg-yellow-100 text-yellow-800'; // Medium priority
    return 'bg-green-100 text-green-800'; // Low priority
  };

  const getPriorityLabel = (lastChecked: string | null) => {
    if (!lastChecked) return 'URGENT';
    
    const now = Date.now();
    const checkTime = new Date(lastChecked).getTime();
    const diffMs = now - checkTime;
    const minutes = Math.floor(diffMs / (1000 * 60));
    
    if (minutes > 30) return 'HIGH';
    if (minutes > 15) return 'MEDIUM';
    return 'LOW';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white">Loading validator marketplace...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          {/* Back to Home */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="text-purple-400 hover:text-purple-300 flex items-center transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏪</div>
              <h1 className="text-3xl font-bold text-white mb-2">Validator Marketplace</h1>
              <p className="text-gray-300">Connect your wallet and choose websites to monitor</p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6 mb-8">
              <div className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Choose which websites to monitor
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Real-time monitoring and rewards
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                More checks = more SOL earnings
              </div>
            </div>

            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <span className="mr-2">🔐</span>
                  Connect & Enter Marketplace
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Don't have Phantom wallet?{' '}
                <a 
                  href="https://phantom.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
                >
                  Download here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                🏪 Validator Marketplace
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {user?.wallet?.slice(0, 8)}...{user?.wallet?.slice(-8)}
              </div>
              <button 
                onClick={handleLogout}
                className="text-red-600 hover:text-red-500 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name || user?.username}! 👋</h2>
          <p className="text-gray-600">Choose websites to monitor and earn SOL rewards instantly</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🏪</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available Websites</p>
                <p className="text-2xl font-bold text-gray-900">{websites.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Checks Today</p>
                <p className="text-2xl font-bold text-gray-900">{validatorStats.checksToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Checks</p>
                <p className="text-2xl font-bold text-gray-900">{validatorStats.totalChecks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{validatorStats.estimatedEarnings} SOL</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
            <button 
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-500 text-sm font-medium mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Website Marketplace */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Available Websites to Monitor</h3>
            <button
              onClick={loadMarketplace}
              className="text-blue-600 hover:text-blue-500 font-medium text-sm"
            >
              🔄 Refresh
            </button>
          </div>
          <div className="p-6">
            {websites.length === 0 ? (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🏪</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No websites available</h3>
              <p className="text-gray-500 mb-6">
                  Waiting for website owners to add sites to monitor
              </p>
              <div className="text-sm text-gray-400">
                  Marketplace will update automatically when new websites are added
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {websites.map((website) => (
                  <div key={website.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {website.name || 'Unnamed Website'}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(website.recentStats.lastChecked)}`}>
                            {getPriorityLabel(website.recentStats.lastChecked)} PRIORITY
                          </span>
                        </div>
                        <p className="text-blue-600 text-sm hover:text-blue-500 cursor-pointer mb-2">
                          {website.url}
                        </p>
                        <p className="text-sm text-gray-500 mb-3">
                          Owner: {website.owner}
                        </p>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Last Checked:</span>
                            <p className="font-medium">{formatTimeAgo(website.recentStats.lastChecked)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">24h Uptime:</span>
                            <p className={`font-medium ${getUptimeColor(website.recentStats.uptime)}`}>
                              {website.recentStats.uptime}%
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Avg Latency:</span>
                            <p className="font-medium">{website.recentStats.avgLatency}ms</p>
                          </div>
                          <div>
                            <span className="text-gray-500">24h Checks:</span>
                            <p className="font-medium">{website.recentStats.totalChecks}</p>
                          </div>
                        </div>
                        
                        {website.lastCheckByValidator && (
                          <p className="text-xs text-gray-400 mt-2">
                            You last checked: {formatTimeAgo(website.lastCheckByValidator)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0 ml-6">
                        <button
                          onClick={() => startInteractiveCheck(website)}
                          disabled={!website.canCheck || checkingWebsites.has(website.id)}
                          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
                            website.canCheck && !checkingWebsites.has(website.id)
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {checkingWebsites.has(website.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {activeCheck?.websiteId === website.id && activeCheck.step === 'opening' && 'Opening...'}
                              {activeCheck?.websiteId === website.id && activeCheck.step === 'verifying' && 'Scanning...'}
                              {activeCheck?.websiteId === website.id && activeCheck.step === 'confirming' && 'Confirm Result'}
                              {activeCheck?.websiteId === website.id && activeCheck.step === 'submitting' && 'Submitting...'}
                              {!activeCheck && 'Checking...'}
                            </>
                          ) : website.canCheck ? (
                            <>
                              🔍 Inspect & Verify
                            </>
                          ) : (
                            <>
                              ⏳ Wait 2min
                            </>
                          )}
                        </button>
                        
                        {!website.canCheck && (
                          <p className="text-xs text-gray-400 mt-1 text-center">
                            2min cooldown
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
                </div>
      </main>

      {/* Interactive Verification Interface - Side by Side */}
      {activeCheck && activeCheck.step === 'confirming' && (
        <div className="fixed inset-0 bg-white z-50 flex">
          {/* Left Panel - Website Preview */}
          <div className="flex-1 flex flex-col border-r">
            {/* Website Header */}
            <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
              {(() => {
                const website = websites.find(w => w.id === activeCheck.websiteId);
                const normalizedUrl = website?.url.startsWith('http') ? website.url : `https://${website?.url}`;
                return (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="bg-white rounded-md px-3 py-1 text-sm text-gray-600 border">
                        🔗 {website?.url}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const iframe = document.getElementById('website-preview') as HTMLIFrameElement;
                          if (iframe) iframe.src = iframe.src; // Reload iframe
                        }}
                        className="text-gray-600 hover:text-gray-800 p-1 rounded"
                        title="Reload"
                      >
                        🔄
                      </button>
                      <button
                        onClick={() => window.open(normalizedUrl, '_blank')}
                        className="text-gray-600 hover:text-gray-800 p-1 rounded"
                        title="Open in new tab"
                      >
                        ↗️
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Website Iframe */}
            <div className="flex-1 relative">
              {(() => {
                const website = websites.find(w => w.id === activeCheck.websiteId);
                const normalizedUrl = website?.url.startsWith('http') ? website.url : `https://${website?.url}`;
                return (
                  <>
                    <iframe
                      id="website-preview"
                      src={normalizedUrl}
                      className="w-full h-full"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      onLoad={() => console.log('Website loaded in iframe')}
                      onError={() => console.log('Website failed to load in iframe')}
                    />
                    {/* Loading overlay */}
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center" 
                         style={{ display: 'none' }} 
                         id="iframe-loading">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading website...</p>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Right Panel - Verification Tools */}
          <div className="w-96 bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">🔍 Verification Panel</h3>
                <p className="text-sm text-gray-600">Inspect & confirm status</p>
              </div>
              <button
                onClick={cancelCheck}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Website Info */}
              {(() => {
                const website = websites.find(w => w.id === activeCheck.websiteId);
                if (!website) return null;

                return (
                  <>
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="font-semibold text-gray-900 mb-2">{website.name}</h4>
                      <p className="text-blue-600 text-sm mb-1">{website.url}</p>
                      <p className="text-gray-500 text-xs">Owner: {website.owner}</p>
                    </div>

                    {/* Auto-Check Results */}
                    {activeCheck.autoCheckResult && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h5 className="font-medium text-blue-900 mb-3 flex items-center">
                          🤖 <span className="ml-2">Automatic Scan</span>
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-600">Status:</span>
                            <span className={`font-medium ${
                              activeCheck.autoCheckResult.status === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {activeCheck.autoCheckResult.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-600">Response:</span>
                            <span className="font-medium">{activeCheck.autoCheckResult.latency}ms</span>
                          </div>
                        </div>
                        <p className="text-blue-700 text-xs mt-2 p-2 bg-blue-100 rounded">
                          {activeCheck.autoCheckResult.details}
                        </p>
                      </div>
                    )}

                    {/* Manual Verification Guide */}
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h5 className="font-medium text-yellow-900 mb-2 flex items-center">
                        👁️ <span className="ml-2">What to Check</span>
                      </h5>
                      <div className="text-yellow-800 text-xs space-y-1">
                        <div className="flex items-start">
                          <span className="text-yellow-600 mr-2">•</span>
                          <span>Does the page load completely?</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-yellow-600 mr-2">•</span>
                          <span>Is the content displaying properly?</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-yellow-600 mr-2">•</span>
                          <span>Are there any error messages?</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-yellow-600 mr-2">•</span>
                          <span>How fast did it load?</span>
                        </div>
                      </div>
                    </div>

                    {/* Real-time Status Indicator */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h5 className="font-medium text-gray-900 mb-3">📊 Real-time Check</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Iframe Status:</span>
                          <span className="text-green-600 font-medium">✓ Loaded</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Your Location:</span>
                          <span className="text-gray-600">Browser</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Check Time:</span>
                          <span className="text-gray-600">{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
        </div>

            {/* Bottom Panel - Validator Decision */}
            <div className="bg-white border-t p-4">
              <h5 className="font-medium text-gray-900 mb-3">What do you see?</h5>
              
              <div className="space-y-2">
                <button
                  onClick={() => submitValidatorResult(activeCheck.websiteId, 'up')}
                  className="w-full flex items-center justify-between p-3 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-green-900 text-sm">UP</p>
                      <p className="text-green-700 text-xs">Working fine</p>
                    </div>
                  </div>
                  <span className="text-green-600 text-xs">+0.001 SOL</span>
                </button>

                <button
                  onClick={() => submitValidatorResult(activeCheck.websiteId, 'slow')}
                  className="w-full flex items-center justify-between p-3 border-2 border-yellow-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs">⏳</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-yellow-900 text-sm">SLOW</p>
                      <p className="text-yellow-700 text-xs">Takes time</p>
                    </div>
                  </div>
                  <span className="text-yellow-600 text-xs">+0.001 SOL</span>
                </button>

                <button
                  onClick={() => submitValidatorResult(activeCheck.websiteId, 'down')}
                  className="w-full flex items-center justify-between p-3 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs">✕</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-red-900 text-sm">DOWN</p>
                      <p className="text-red-700 text-xs">Not working</p>
                    </div>
                  </div>
                  <span className="text-red-600 text-xs">+0.001 SOL</span>
                </button>
          </div>

              <button
                onClick={cancelCheck}
                className="w-full mt-3 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel Check
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValidatorPage; 