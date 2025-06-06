import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  userType: string;
  solanaWallet?: string;
  createdAt: string;
}

interface Website {
  id: string;
  url: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastCheck: string;
  uptime: number;
}

function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const [newWebsite, setNewWebsite] = useState({ name: '', url: '' });
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
    
    // Load user's websites
    loadWebsites();
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
        setWebsites(data);
      }
    } catch (error) {
      console.error('Failed to load websites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        setNewWebsite({ name: '', url: '' });
        setShowAddWebsite(false);
        loadWebsites(); // Reload websites list
      }
    } catch (error) {
      console.error('Failed to add website:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-red-400';
      case 'error': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅';
      case 'inactive': return '❌';
      case 'error': return '⚠️';
      default: return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Website Monitoring Dashboard</h1>
              <div className="flex items-center mt-2 space-x-4">
                <p className="text-gray-300">
                  Welcome back, {user?.email?.split('@')[0] || 'User'}
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
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl border border-white/20 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total Websites</p>
                    <p className="text-3xl font-bold text-white">{websites.length}</p>
                  </div>
                  <div className="text-4xl">🌐</div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Active Sites</p>
                    <p className="text-3xl font-bold text-green-400">
                      {websites.filter(w => w.status === 'active').length}
                    </p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Average Uptime</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {websites.length > 0 
                        ? Math.round(websites.reduce((acc, w) => acc + w.uptime, 0) / websites.length)
                        : 0}%
                    </p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>
            </div>

            {/* Websites Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Your Websites</h2>
                <button
                  onClick={() => setShowAddWebsite(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  + Add Website
                </button>
              </div>

              {websites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🌐</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No websites yet</h3>
                  <p className="text-gray-300 mb-6">Add your first website to start monitoring</p>
                  <button
                    onClick={() => setShowAddWebsite(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Add Your First Website
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {websites.map((website) => (
                    <div key={website.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold text-white mr-3">{website.name}</h3>
                            <span className={`flex items-center ${getStatusColor(website.status)}`}>
                              <span className="mr-1">{getStatusIcon(website.status)}</span>
                              {website.status}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mt-1">{website.url}</p>
                          <p className="text-gray-400 text-xs mt-2">
                            Last checked: {new Date(website.lastCheck).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{website.uptime}%</div>
                          <div className="text-xs text-gray-400">Uptime</div>
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
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddWebsite(false)}
                    className="flex-1 bg-white/10 text-white py-3 px-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Add Website
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage; 