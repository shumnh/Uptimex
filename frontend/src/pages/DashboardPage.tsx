import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email?: string;
  username: string;
  role: string;
  solanaWallet?: string;
  createdAt: string;
}

interface Website {
  _id: string;
  url: string;
  name?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  rewardPerCheck?: number;
  autoPayments?: boolean;
  walletBalance?: number;
}

interface WebsiteStats {
  uptime: number;
  totalChecks: number;
  averageLatency: number;
  currentStatus: 'up' | 'down' | 'unknown';
  timeframe: string;
  lastChecked: string | null;
  checkHistory?: CheckHistoryItem[];
}

interface CheckHistoryItem {
  timestamp: string;
  status: 'up' | 'down';
  latency: number;
  validator: string;
  validatorName?: string;
}

interface WebsiteWithStats extends Website {
  stats?: WebsiteStats;
}

interface ValidatorPerformance {
  validatorId: string;
  validatorName: string;
  totalChecks: number;
  accuracy: number;
  avgResponseTime: number;
  totalEarned: number;
  lastCheck: string;
}

function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [websites, setWebsites] = useState<WebsiteWithStats[]>([]);
  const [validatorPerformance, setValidatorPerformance] = useState<ValidatorPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showRewardSettings, setShowRewardSettings] = useState<string | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [newWebsite, setNewWebsite] = useState({ 
    name: '', 
    url: '', 
    rewardPerCheck: 0.001,
    autoPayments: true 
  });
  const [addingWebsite, setAddingWebsite] = useState(false);
  const [deletingWebsite, setDeletingWebsite] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Load user's data
    loadWebsites();
    loadValidatorPerformance();
  }, [navigate]);

  const loadWebsites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/websites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.websites) {
          const websitesWithStats = await Promise.all(
            data.websites.map(async (website: Website) => {
              try {
                const statsResponse = await fetch(
                  `http://localhost:4000/api/websites/${website._id}/stats?timeframe=${selectedTimeframe}`,
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  }
                );
                
                if (statsResponse.ok) {
                  const statsData = await statsResponse.json();
                  return {
                    ...website,
                    stats: statsData.success ? statsData.stats : undefined
                  };
                }
              } catch (error) {
                console.error(`Failed to load stats for ${website.url}:`, error);
              }
              
              return website;
            })
          );
          
          setWebsites(websitesWithStats);
        }
      } else {
        console.error('Failed to load websites:', response.status);
      }
    } catch (error) {
      console.error('Failed to load websites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadValidatorPerformance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/checks/validator-performance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setValidatorPerformance(data.validators || []);
        }
      }
    } catch (error) {
      console.error('Failed to load validator performance:', error);
    }
  };

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingWebsite(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/websites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWebsite),
      });

      if (response.ok) {
        setNewWebsite({ 
          name: '', 
          url: '', 
          rewardPerCheck: 0.001,
          autoPayments: true 
        });
        setShowAddWebsite(false);
        loadWebsites(); // Reload websites list
      } else {
        const errorData = await response.json();
        alert(`Failed to add website: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to add website:', error);
      alert('Network error. Please try again.');
    } finally {
      setAddingWebsite(false);
    }
  };

  const handleDeleteWebsite = async (websiteId: string) => {
    setDeletingWebsite(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/websites/${websiteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setShowDeleteConfirm(null);
        loadWebsites(); // Reload websites list
        console.log('✅ Website deleted successfully');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete website: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete website:', error);
      alert('Network error. Please try again.');
    } finally {
      setDeletingWebsite(false);
    }
  };

  const handleUpdateRewardSettings = async (websiteId: string, settings: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/websites/${websiteId}/reward-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setShowRewardSettings(null);
        loadWebsites(); // Reload websites list
        console.log('✅ Reward settings updated');
      } else {
        const errorData = await response.json();
        alert(`Failed to update settings: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to update reward settings:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'unknown': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'up': return '✅';
      case 'down': return '❌';
      case 'unknown': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'up': return 'Online';
      case 'down': return 'Offline';
      case 'unknown': return 'Unknown';
      default: return 'No Data';
    }
  };

  const formatLatency = (latency?: number) => {
    if (!latency) return 'N/A';
    return `${latency}ms`;
  };

  const formatLastChecked = (lastChecked?: string | null) => {
    if (!lastChecked) return 'Never';
    const date = new Date(lastChecked);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const generateMockChartData = (website: WebsiteWithStats) => {
    // Generate mock uptime data for the last 24 hours
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const uptime = Math.random() > 0.1 ? 100 : Math.random() * 100;
      data.push({
        time: time.getHours() + ':00',
        uptime: uptime,
        checks: Math.floor(Math.random() * 10) + 5
      });
    }
    return data;
  };

  // Calculate overall statistics
  const totalWebsites = websites.length;
  const activeWebsites = websites.filter(w => w.stats?.currentStatus === 'up').length;
  const averageUptime = websites.length > 0 
    ? Math.round(websites.reduce((acc, w) => acc + (w.stats?.uptime || 0), 0) / websites.length)
    : 0;
  const totalRewards = websites.reduce((acc, w) => acc + ((w.rewardPerCheck || 0) * (w.stats?.totalChecks || 0)), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  const displayName = user?.username || user?.email?.split('@')[0] || 'User';
  const isWalletUser = user?.solanaWallet;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Website Owner Dashboard</h1>
              <div className="flex items-center mt-2 space-x-4">
                <p className="text-gray-300">
                  Welcome back, {displayName}
                </p>
                {isWalletUser && (
                  <div className="flex items-center bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                    <span className="text-purple-400 mr-2">🔗</span>
                    <span className="text-purple-200 text-sm font-mono">
                      {user.solanaWallet?.slice(0, 6)}...{user.solanaWallet?.slice(-4)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Timeframe Selector */}
              <select
                value={selectedTimeframe}
                onChange={(e) => {
                  setSelectedTimeframe(e.target.value);
                  setTimeout(() => loadWebsites(), 100); // Reload with new timeframe
                }}
                className="bg-white/10 border border-white/20 rounded-xl text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h" className="bg-slate-800">Last 24 Hours</option>
                <option value="7d" className="bg-slate-800">Last 7 Days</option>
                <option value="30d" className="bg-slate-800">Last 30 Days</option>
              </select>
              
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl border border-white/20 transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total Websites</p>
                    <p className="text-3xl font-bold text-white">{totalWebsites}</p>
                    <p className="text-xs text-green-400 mt-1">📈 Active monitoring</p>
                  </div>
                  <div className="text-4xl">🌐</div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Online Now</p>
                    <p className="text-3xl font-bold text-green-400">{activeWebsites}</p>
                    <p className="text-xs text-gray-400">
                      {totalWebsites > 0 ? Math.round((activeWebsites / totalWebsites) * 100) : 0}% of total
                    </p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Average Uptime</p>
                    <p className="text-3xl font-bold text-blue-400">{averageUptime}%</p>
                    <p className="text-xs text-gray-400">
                      {selectedTimeframe === '24h' ? 'Last 24 hours' : 
                       selectedTimeframe === '7d' ? 'Last 7 days' : 'Last 30 days'}
                    </p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total Rewards Paid</p>
                    <p className="text-3xl font-bold text-yellow-400">{totalRewards.toFixed(3)}</p>
                    <p className="text-xs text-yellow-400">SOL to validators</p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>
            </div>

            {/* Validator Performance Section */}
            {validatorPerformance.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
                <h2 className="text-xl font-bold text-white mb-6">Validator Performance</h2>
                <div className="grid gap-4">
                  {validatorPerformance.slice(0, 5).map((validator) => (
                    <div key={validator.validatorId} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{validator.validatorName}</h3>
                          <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
                            <div>
                              <span className="text-gray-400">Checks:</span>
                              <span className="text-white ml-1 font-semibold">{validator.totalChecks}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Accuracy:</span>
                              <span className="text-green-400 ml-1 font-semibold">{validator.accuracy}%</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Avg Response:</span>
                              <span className="text-blue-400 ml-1 font-semibold">{validator.avgResponseTime}ms</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Earned:</span>
                              <span className="text-yellow-400 ml-1 font-semibold">{validator.totalEarned} SOL</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Websites Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Your Websites</h2>
                <button
                  onClick={() => setShowAddWebsite(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center"
                >
                  <span className="mr-2">+</span>
                  Add Website
                </button>
              </div>

              {websites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🌐</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No websites yet</h3>
                  <p className="text-gray-300 mb-6">Add your first website to start monitoring and paying validators</p>
                  <button
                    onClick={() => setShowAddWebsite(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Add Your First Website
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {websites.map((website) => (
                    <div key={website._id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-white mr-3">
                              {website.name || 'Unnamed Website'}
                            </h3>
                            <span className={`flex items-center ${getStatusColor(website.stats?.currentStatus)} bg-white/10 px-2 py-1 rounded-full text-sm`}>
                              <span className="mr-1">{getStatusIcon(website.stats?.currentStatus)}</span>
                              {getStatusText(website.stats?.currentStatus)}
                            </span>
                          </div>
                          
                          <p className="text-blue-300 text-sm mb-3 hover:text-blue-200 cursor-pointer">
                            {website.url}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedWebsite(website._id)}
                            className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            📊 Analytics
                          </button>
                          <button
                            onClick={() => setShowRewardSettings(website._id)}
                            className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            💰 Rewards
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(website._id)}
                            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      {/* Website Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-400">Uptime:</span>
                          <span className="text-white ml-1 font-semibold">
                            {website.stats?.uptime?.toFixed(1) || 0}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Avg Latency:</span>
                          <span className="text-white ml-1 font-semibold">
                            {formatLatency(website.stats?.averageLatency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Total Checks:</span>
                          <span className="text-white ml-1 font-semibold">
                            {website.stats?.totalChecks || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Last Check:</span>
                          <span className="text-white ml-1 font-semibold">
                            {formatLastChecked(website.stats?.lastChecked)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Reward/Check:</span>
                          <span className="text-yellow-400 ml-1 font-semibold">
                            {website.rewardPerCheck || 0.001} SOL
                          </span>
                        </div>
                      </div>

                      {/* Mini Chart for Each Website */}
                      {selectedWebsite === website._id && (
                        <div className="mt-4 p-4 bg-white/5 rounded-lg">
                          <h4 className="text-white font-semibold mb-3">24-Hour Uptime Chart</h4>
                          <div className="h-32 flex items-end space-x-1">
                            {generateMockChartData(website).map((point, index) => (
                              <div key={index} className="flex-1 flex flex-col items-center">
                                <div 
                                  className={`w-full rounded-t ${point.uptime > 95 ? 'bg-green-400' : point.uptime > 80 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                  style={{ height: `${point.uptime}%` }}
                                ></div>
                                <span className="text-xs text-gray-400 mt-1">{point.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Website Modal */}
        {showAddWebsite && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-6">Add New Website</h3>
              
              <form onSubmit={handleAddWebsite} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Website Name
                  </label>
                  <input
                    type="text"
                    value={newWebsite.name}
                    onChange={(e) => setNewWebsite(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="My Website"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={newWebsite.url}
                    onChange={(e) => setNewWebsite(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Reward per Check (SOL)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={newWebsite.rewardPerCheck}
                    onChange={(e) => setNewWebsite(prev => ({ ...prev, rewardPerCheck: parseFloat(e.target.value) }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0.001"
                  />
                  <p className="text-gray-400 text-xs mt-1">Amount paid to validators for each check</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoPayments"
                    checked={newWebsite.autoPayments}
                    onChange={(e) => setNewWebsite(prev => ({ ...prev, autoPayments: e.target.checked }))}
                    className="mr-3"
                  />
                  <label htmlFor="autoPayments" className="text-gray-300 text-sm">
                    Enable automatic payments to validators
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddWebsite(false)}
                    className="flex-1 bg-white/10 text-white py-3 px-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                    disabled={addingWebsite}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingWebsite}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {addingWebsite ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Website'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Website</h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete this website? This action cannot be undone and will remove all monitoring data.
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 bg-white/10 text-white py-3 px-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                    disabled={deletingWebsite}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteWebsite(showDeleteConfirm)}
                    disabled={deletingWebsite}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {deletingWebsite ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete Website'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reward Settings Modal */}
        {showRewardSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-6">💰 Reward Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Reward per Check (SOL)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    defaultValue="0.001"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Wallet Balance
                  </label>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Current Balance:</span>
                      <span className="text-yellow-400 font-bold">0.500 SOL</span>
                    </div>
                    <button className="w-full mt-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300">
                      Top Up Wallet
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoPaymentsModal"
                    defaultChecked
                    className="mr-3"
                  />
                  <label htmlFor="autoPaymentsModal" className="text-gray-300 text-sm">
                    Enable automatic payments
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowRewardSettings(null)}
                    className="flex-1 bg-white/10 text-white py-3 px-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateRewardSettings(showRewardSettings, {})}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage; 