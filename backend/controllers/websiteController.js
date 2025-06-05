const Website = require('../models/Website');
const Check = require('../models/Check');

exports.createWebsite = async (req, res) => {
  const { url, name } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  try {
    const website = await Website.create({ url, name, owner: req.user.id });
    res.status(201).json(website);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create website' });
  }
};

// Get all websites for the logged-in user
exports.getUserWebsites = async (req, res) => {
  try {
    const websites = await Website.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      websites: websites
    });
  } catch (err) {
    console.error('Error fetching user websites:', err);
    res.status(500).json({ error: 'Failed to fetch websites' });
  }
};

// Get website statistics (uptime percentage, average latency)
exports.getWebsiteStats = async (req, res) => {
  try {
    const { websiteId } = req.params;
    const { timeframe = '24h' } = req.query; // 24h, 7d, 30d

    // Verify website belongs to user
    const website = await Website.findOne({ _id: websiteId, owner: req.user.id });
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Calculate time range
    let startTime;
    switch (timeframe) {
      case '7d':
        startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // 24h
        startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    // Get all checks in timeframe
    const checks = await Check.find({
      website: websiteId,
      timestamp: { $gte: startTime }
    }).sort({ timestamp: -1 });

    if (checks.length === 0) {
      return res.json({
        success: true,
        stats: {
          uptime: 0,
          totalChecks: 0,
          averageLatency: 0,
          timeframe: timeframe
        }
      });
    }

    // Calculate uptime percentage
    const upChecks = checks.filter(check => check.status === 'up').length;
    const uptimePercentage = ((upChecks / checks.length) * 100).toFixed(2);

    // Calculate average latency (only for 'up' checks)
    const upCheckLatencies = checks.filter(check => check.status === 'up').map(check => check.latency);
    const averageLatency = upCheckLatencies.length > 0 
      ? Math.round(upCheckLatencies.reduce((sum, latency) => sum + latency, 0) / upCheckLatencies.length)
      : 0;

    // Get current status (most recent check)
    const currentStatus = checks[0]?.status || 'unknown';

    res.json({
      success: true,
      stats: {
        uptime: parseFloat(uptimePercentage),
        totalChecks: checks.length,
        averageLatency: averageLatency,
        currentStatus: currentStatus,
        timeframe: timeframe,
        lastChecked: checks[0]?.timestamp || null
      }
    });

  } catch (err) {
    console.error('Error fetching website stats:', err);
    res.status(500).json({ error: 'Failed to fetch website statistics' });
  }
};

// Get website check history for charts
exports.getWebsiteHistory = async (req, res) => {
  try {
    const { websiteId } = req.params;
    const { timeframe = '24h', limit = 100 } = req.query;

    // Verify website belongs to user
    const website = await Website.findOne({ _id: websiteId, owner: req.user.id });
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Calculate time range
    let startTime;
    switch (timeframe) {
      case '7d':
        startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // 24h
        startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    // Get check history
    const checks = await Check.find({
      website: websiteId,
      timestamp: { $gte: startTime }
    })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .populate('validator', 'username solanaWallet');

    // Format for chart data
    const history = checks.map(check => ({
      timestamp: check.timestamp,
      status: check.status,
      latency: check.latency,
      validator: {
        id: check.validator._id,
        username: check.validator.username,
        wallet: check.validator.solanaWallet?.slice(-8) // Last 8 chars for privacy
      }
    }));

    res.json({
      success: true,
      history: history,
      count: history.length,
      timeframe: timeframe
    });

  } catch (err) {
    console.error('Error fetching website history:', err);
    res.status(500).json({ error: 'Failed to fetch website history' });
  }
}; 