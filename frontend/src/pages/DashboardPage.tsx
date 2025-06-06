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
      const response = await fetch(`http://localhost:4000/api/websites/${websiteId}/rewards`, {
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
      } else {
        const errorData = await response.json();
        alert(`Failed to update reward settings: ${errorData.error || 'Unknown error'}`);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-300 border-t-blue-600 mx-auto mb-6"></div>
          <div className="text-slate-700 text-xl font-medium">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  const displayName = user?.username || user?.email?.split('@')[0] || 'User';
  const isWalletUser = user?.solanaWallet;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%236366f1%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-blue-400/8 to-indigo-400/8 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-slate-400/8 to-blue-400/8 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-indigo-400/8 to-purple-400/8 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-xl">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                
                <div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2">Website Monitoring</h1>
                  <div className="flex items-center space-x-4">
                    <p className="text-lg text-slate-600 font-medium">
                      Welcome back, <span className="text-blue-600 font-bold">{displayName}</span>
                    </p>
                    {isWalletUser && (
                      <div className="flex items-center bg-blue-100 px-4 py-2 rounded-xl border border-blue-200">
                        <span className="text-blue-600 mr-3 text-lg">🔗</span>
                        <span className="text-blue-700 text-sm font-mono font-bold">
                          {user.solanaWallet?.slice(0, 6)}...{user.solanaWallet?.slice(-4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Timeframe Selector */}
                <div className="flex items-center space-x-3">
                  <label className="text-slate-700 font-medium">Timeframe:</label>
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => {
                      setSelectedTimeframe(e.target.value);
                      setTimeout(() => loadWebsites(), 100);
                    }}
                    className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl text-slate-700 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
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
                  <p className="text-slate-600 text-sm font-medium mb-2">Total Websites</p>
                  <p className="text-4xl font-black text-slate-900 mb-2">{totalWebsites}</p>
                  <p className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full inline-block">
                    📈 Actively monitored
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🌐</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium mb-2">Currently Online</p>
                  <p className="text-4xl font-black text-green-600 mb-2">{activeWebsites}</p>
                  <p className="text-xs text-slate-600 font-medium bg-slate-100 px-2 py-1 rounded-full inline-block">
                    {totalWebsites > 0 ? Math.round((activeWebsites / totalWebsites) * 100) : 0}% of total
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
                  <p className="text-slate-600 text-sm font-medium mb-2">Average Uptime</p>
                  <p className="text-4xl font-black text-blue-600 mb-2">{averageUptime}%</p>
                  <p className="text-xs text-slate-600 font-medium bg-slate-100 px-2 py-1 rounded-full inline-block">
                    {selectedTimeframe === '24h' ? 'Last 24 hours' : 
                     selectedTimeframe === '7d' ? 'Last 7 days' : 'Last 30 days'}
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
                  <p className="text-slate-600 text-sm font-medium mb-2">Rewards Paid</p>
                  <p className="text-4xl font-black text-orange-600 mb-2">{totalRewards.toFixed(3)}</p>
                  <p className="text-xs text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded-full inline-block">
                    SOL to validators
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">💰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Validator Performance Section */}
          {validatorPerformance.length > 0 && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl mb-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Top Validators</h2>
                    <p className="text-slate-600 font-medium">Performance overview of your monitoring network</p>
                  </div>
                </div>
                <div className="bg-purple-100 px-4 py-2 rounded-xl">
                  <span className="text-purple-700 font-bold text-sm">{validatorPerformance.length} Active</span>
                </div>
              </div>
              
              <div className="grid gap-6">
                {validatorPerformance.slice(0, 5).map((validator, index) => (
                  <div key={validator.validatorId} className="bg-slate-50/70 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 hover:bg-white/50 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="text-slate-900 font-bold text-lg">{validator.validatorName}</h3>
                          <p className="text-slate-600 text-sm">Validator ID: {validator.validatorId.slice(0, 8)}...</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-8 text-center">
                        <div>
                          <div className="text-2xl font-black text-slate-900 mb-1">{validator.totalChecks}</div>
                          <div className="text-slate-600 text-sm font-medium">Total Checks</div>
                        </div>
                        <div>
                          <div className="text-2xl font-black text-green-600 mb-1">{validator.accuracy}%</div>
                          <div className="text-slate-600 text-sm font-medium">Accuracy</div>
                        </div>
                        <div>
                          <div className="text-2xl font-black text-blue-600 mb-1">{validator.avgResponseTime}ms</div>
                          <div className="text-slate-600 text-sm font-medium">Avg Response</div>
                        </div>
                        <div>
                          <div className="text-2xl font-black text-orange-600 mb-1">{validator.totalEarned}</div>
                          <div className="text-slate-600 text-sm font-medium">SOL Earned</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Websites Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 0l-3-3m3 3l3-3" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Your Websites</h2>
                  <p className="text-slate-600 font-medium">Manage and monitor your website portfolio</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowAddWebsite(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 flex items-center font-bold text-lg hover:-translate-y-1"
              >
                <span className="mr-3 text-xl">+</span>
                Add Website
              </button>
            </div>

            {websites.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <span className="text-6xl">🌐</span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">No websites yet</h3>
                <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium max-w-2xl mx-auto">
                  Add your first website to start monitoring uptime, performance, and paying validators for their service.
                </p>
                <button
                  onClick={() => setShowAddWebsite(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl hover:shadow-2xl transition-all duration-300 font-bold text-xl hover:-translate-y-1"
                >
                  Add Your First Website
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {websites.map((website) => (
                  <div key={website._id} className="bg-slate-50/70 backdrop-blur-md rounded-2xl p-8 border border-slate-200/50 hover:bg-white/50 transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <h3 className="text-2xl font-black text-slate-900">
                            {website.name || 'Unnamed Website'}
                          </h3>
                          <span className={`flex items-center ${getStatusColor(website.stats?.currentStatus)} bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold border border-white/50 shadow-lg`}>
                            <span className="mr-2 text-lg">{getStatusIcon(website.stats?.currentStatus)}</span>
                            {getStatusText(website.stats?.currentStatus)}
                          </span>
                        </div>
                        
                        <p className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium text-lg mb-4 bg-blue-50 inline-block px-4 py-2 rounded-xl">
                          {website.url}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedWebsite(website._id)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm transition-colors font-bold border border-blue-200"
                        >
                          📊 Analytics
                        </button>
                        <button
                          onClick={() => setShowRewardSettings(website._id)}
                          className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-3 rounded-xl text-sm transition-colors font-bold border border-orange-200"
                        >
                          💰 Rewards
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(website._id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-3 rounded-xl text-sm transition-colors font-bold border border-red-200"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    {/* Website Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
                      <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-white/50">
                        <span className="text-slate-600 text-sm font-medium block mb-2">Uptime</span>
                        <span className="text-2xl font-black text-slate-900">
                          {website.stats?.uptime?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-white/50">
                        <span className="text-slate-600 text-sm font-medium block mb-2">Total Checks</span>
                        <span className="text-2xl font-black text-slate-900">
                          {website.stats?.totalChecks || 0}
                        </span>
                      </div>
                      <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-white/50">
                        <span className="text-slate-600 text-sm font-medium block mb-2">Avg Latency</span>
                        <span className="text-2xl font-black text-slate-900">
                          {formatLatency(website.stats?.averageLatency)}
                        </span>
                      </div>
                      <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-white/50">
                        <span className="text-slate-600 text-sm font-medium block mb-2">Last Checked</span>
                        <span className="text-xl font-black text-slate-900">
                          {formatLastChecked(website.stats?.lastChecked)}
                        </span>
                      </div>
                      <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-white/50">
                        <span className="text-slate-600 text-sm font-medium block mb-2">Reward/Check</span>
                        <span className="text-xl font-black text-orange-600">
                          {website.rewardPerCheck || 0.001} SOL
                        </span>
                      </div>
                    </div>

                    {/* Performance Chart Placeholder */}
                    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/50">
                      <h4 className="text-lg font-bold text-slate-900 mb-4">24-Hour Performance</h4>
                      <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-slate-600 font-medium">📈 Chart visualization will be implemented</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Website Modal */}
      {showAddWebsite && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-white/50 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">+</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Add New Website</h3>
                  <p className="text-slate-600 font-medium">Start monitoring a new website</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddWebsite(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddWebsite} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">Website Name</label>
                <input
                  type="text"
                  value={newWebsite.name}
                  onChange={(e) => setNewWebsite({...newWebsite, name: e.target.value})}
                  placeholder="e.g. My Portfolio Site"
                  className="w-full px-4 py-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">Website URL</label>
                <input
                  type="url"
                  value={newWebsite.url}
                  onChange={(e) => setNewWebsite({...newWebsite, url: e.target.value})}
                  placeholder="https://example.com"
                  className="w-full px-4 py-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">Reward per Check (SOL)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={newWebsite.rewardPerCheck}
                  onChange={(e) => setNewWebsite({...newWebsite, rewardPerCheck: parseFloat(e.target.value)})}
                  className="w-full px-4 py-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  required
                />
                <p className="text-sm text-slate-600 mt-2 font-medium">Amount of SOL paid to validators for each check</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="autoPayments"
                  checked={newWebsite.autoPayments}
                  onChange={(e) => setNewWebsite({...newWebsite, autoPayments: e.target.checked})}
                  className="w-5 h-5 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="autoPayments" className="text-sm font-bold text-slate-900">
                  Enable automatic payments to validators
                </label>
              </div>
              
              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddWebsite(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingWebsite}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {addingWebsite ? 'Adding...' : 'Add Website'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-white/50 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🗑️</span>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-4">Delete Website</h3>
              <p className="text-slate-600 mb-8 font-medium">
                Are you sure you want to delete this website? This action cannot be undone.
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteWebsite(showDeleteConfirm)}
                  disabled={deletingWebsite}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  {deletingWebsite ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reward Settings Modal */}
      {showRewardSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-white/50 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Reward Settings</h3>
                  <p className="text-slate-600 font-medium">Configure validator payments</p>
                </div>
              </div>
              <button
                onClick={() => setShowRewardSettings(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all"
              >
                ×
              </button>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
              <p className="text-orange-700 font-medium text-lg">
                Reward settings configuration will be implemented in the next update.
              </p>
            </div>
            
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setShowRewardSettings(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-8 py-4 rounded-xl transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage; 