const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Parser = require('rss-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const parser = new Parser();

// Signup
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Username and password required');
  const hashed = await bcrypt.hash(password, 10);
  try {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashed]);
    res.status(201).send('User created');
  } catch (err) { res.status(500).send(err.message); }
});

// Signin
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Username and password required');
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (result.rows.length && await bcrypt.compare(password, result.rows[0].password)) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else { res.status(401).send('Invalid credentials'); }
});

// Middleware for auth
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Unauthorized');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Forbidden');
    req.user = user;
    next();
  });
};

// Get/Save topics
app.get('/topics', authenticate, async (req, res) => {
  const result = await pool.query('SELECT topics FROM user_prefs WHERE username = $1', [req.user.username]);
  res.json(result.rows[0]?.topics || []);
});

app.post('/topics', authenticate, async (req, res) => {
  const { topics } = req.body;
  if (!Array.isArray(topics) || !topics.every(t => typeof t === 'string' && t.trim())) {
    return res.status(400).send('Topics must be an array of non-empty strings');
  }
  try {
    await pool.query('INSERT INTO user_prefs (username, topics) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET topics = $2', [req.user.username, topics]);
    res.send('Topics saved');
  } catch (err) { res.status(500).send(err.message); }
});

// Fetch news from RSS feeds
app.get('/news', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT topics FROM user_prefs WHERE username = $1', [req.user.username]);
    const topics = result.rows[0]?.topics || [];
    if (!topics.length || !topics.every(t => typeof t === 'string' && t.trim())) {
      return res.json([]);
    }
    // Map topics to BBC RSS feeds (example mapping, adjust as needed)
    const rssFeeds = {
      tech: 'http://feeds.bbci.co.uk/news/technology/rss.xml',
      business: 'http://feeds.bbci.co.uk/news/business/rss.xml',
      world: 'http://feeds.bbci.co.uk/news/world/rss.xml',
      default: 'http://feeds.bbci.co.uk/news/rss.xml'
    };
    const feedUrl = topics.map(t => rssFeeds[t.toLowerCase()] || rssFeeds.default)[0]; // Use first topic or default
    const feed = await parser.parseURL(feedUrl);
    const articles = feed.items.map(item => ({
      title: item.title,
      description: item.contentSnippet,
      url: item.link,
      publishedAt: item.pubDate
    }));
    res.json(articles);
  } catch (err) {
    console.error('RSS fetch error:', err);
    res.status(500).send('Failed to fetch news');
  }
});

// Serve frontend
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));

app.listen(3000, () => console.log('Server running'));
