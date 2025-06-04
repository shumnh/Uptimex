const Website = require('../models/Website');

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