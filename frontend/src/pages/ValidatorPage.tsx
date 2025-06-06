import { useState } from 'react';
import { Link } from 'react-router-dom';

function ValidatorPage() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    setLoading(true);
    try {
      // Check if Phantom wallet is installed
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        setWalletConnected(true);
        console.log('Wallet connected:', response.publicKey.toString());
      } else {
        alert('Phantom Wallet not found! Please install it from https://phantom.app/');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    if (window.solana) {
      window.solana.disconnect();
    }
  };

  if (!walletConnected) {
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
              <div className="text-6xl mb-4">👥</div>
              <h1 className="text-3xl font-bold text-white mb-2">Validator Login</h1>
              <p className="text-gray-300">Connect your Solana wallet to start earning rewards</p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Earn rewards for honest work
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Automatic assignment system
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Blockchain-verified payments
              </div>
            </div>

            <button
              onClick={connectWallet}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <span>Connecting...</span>
              ) : (
                <>
                  <span className="mr-2">🔗</span>
                  Connect Phantom Wallet
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
                👥 Validator Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
              </div>
              <button 
                onClick={disconnectWallet}
                className="text-red-600 hover:text-red-500 font-medium"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Validator Dashboard</h2>
          <p className="text-gray-600">Monitor your assignments and earnings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Assignments</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
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
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900">0 SOL</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⏱</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">--%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Assignments */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Current Assignments</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active assignments</h3>
              <p className="text-gray-500 mb-6">
                New assignments will appear here automatically every 5 minutes
              </p>
              <div className="text-sm text-gray-400">
                Next assignment check in: --:--
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">No recent validation activity</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ValidatorPage; 