const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 40, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

app.use(limiter);

let milestones = [];

// Load CSV into memory
const loadMilestones = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, 'vb_mapp_milestones.csv'))
      .pipe(csv())
      .on('data', (data) => milestones.push(data))
      .on('end', () => {
        console.log('CSV file loaded:', milestones.length, 'milestones');
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

// Fetch unique domains from the loaded milestones
const getUniqueDomains = () => {
  const domains = new Set(milestones.map(m => m.Domain).filter(Boolean));
  return Array.from(domains);
};

// Fetch milestones based on domain and level
const getMilestonesByDomainAndLevel = (domain, level) => {
  return milestones.filter(m => m.Domain === domain && m.Level === level);
};

// Fetch unique levels from the loaded milestones
const getUniqueLevels = () => {
  const levels = new Set(milestones.map(m => m.Level).filter(Boolean));
  return Array.from(levels);
};

// Validate message middleware
const validateMessage = (req, res, next) => {
  const { message } = req.body;
  console.log({ message })
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  if (typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message must be a non-empty string' });
  }
  next();
};

// API Endpoint to get unique domains and levels
app.get('/api/domainsAndLevels', (req, res) => {
  try {
    const domains = getUniqueDomains();
    const levels = getUniqueLevels();
    res.status(200).json({ domains, levels });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load domains' });
  }
});

// Chatbot API Endpoint with message validation
app.post('/api/chatbot', validateMessage, (req, res) => {
  const { message, code, domain, level } = req.body;

  if (message === 'Lookup Milestone') {
    const milestone = milestones.filter(m => m.Skill_Code === code);
    if (milestone) {
      return res.json(milestone);
    } else {
      return res.status(404).json({ error: 'Milestone not found' });
    }
  }

  if (message === 'List Domain') {
    const filteredMilestones = getMilestonesByDomainAndLevel(domain, level);
    if (filteredMilestones.length > 0) {
      return res.json(filteredMilestones);
    } else {
      return res.status(404).json({ error: 'No milestones found for this domain and level' });
    }
  }

  return res.status(400).json({ error: 'Invalid request' });
});

// Start the server
const startServer = async () => {
  try {
    await loadMilestones();
    app.listen(PORT, () => {
      console.log(`Backend is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to load milestones:', error);
  }
};

startServer();
