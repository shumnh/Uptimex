const Check = require('../models/Check');

exports.submitCheck = async (req, res) => {
  const { website, status, latency, timestamp, signature } = req.body;
  if (!website || !status || !latency || !timestamp || !signature) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const check = await Check.create({
      website,
      validator: req.user.id,
      status,
      latency,
      timestamp,
      signature
    });
    res.status(201).json(check);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit check' });
  }
}; 