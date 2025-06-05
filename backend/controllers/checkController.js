const Check = require('../models/Check');
const { markAssignmentCompleted } = require('../utils/assignmentLogic');

exports.submitCheck = async (req, res) => {
  const { website, status, latency, timestamp, signature } = req.body;
  if (!website || !status || !latency || !timestamp || !signature) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    // Create the check record
    const check = await Check.create({
      website,
      validator: req.user.id,
      status,
      latency,
      timestamp,
      signature
    });

    // Mark the assignment as completed
    await markAssignmentCompleted(website, req.user.id);

    console.log(`✅ Check submitted for website ${website} by validator ${req.user.id}`);
    
    res.status(201).json({
      success: true,
      check: {
        id: check._id,
        website: check.website,
        status: check.status,
        latency: check.latency,
        timestamp: check.timestamp
      }
    });
  } catch (err) {
    console.error('Error submitting check:', err);
    res.status(500).json({ error: 'Failed to submit check' });
  }
}; 