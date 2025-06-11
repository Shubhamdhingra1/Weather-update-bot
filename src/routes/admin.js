const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next();
  }
  res.redirect('/admin/login');
};

// Login page
router.get('/login', (req, res) => {
  res.render('admin/login', { error: null });
});

// Login handler
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isAuthenticated = true;
    return res.redirect('/admin/dashboard');
  }

  res.render('admin/login', { error: '❌ Invalid credentials' });
});

// Admin dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('admin/dashboard', { users });
  } catch (err) {
    console.error('❌ Dashboard error:', err.message);
    res.status(500).send('❌ Failed to load dashboard');
  }
});

// Block or unblock user
router.post('/user/:id/toggle-block', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.isBlocked = !user.isBlocked;
      await user.save();
    }
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('❌ Block/unblock error:', err.message);
    res.status(500).send('❌ Failed to update user');
  }
});

// Delete a user
router.post('/user/:id/delete', isAuthenticated, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('❌ Delete user error:', err.message);
    res.status(500).send('❌ Failed to delete user');
  }
});

// Settings page
router.get('/settings', isAuthenticated, (req, res) => {
  res.render('admin/settings', {
    weatherApiKey: process.env.WEATHER_API_KEY || '',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    webhookUrl: process.env.WEBHOOK_URL || ''
  });
});

// Update API Keys & Webhook URL (memory only)
router.post('/settings', isAuthenticated, async (req, res) => {
  const { weatherApiKey, telegramBotToken, webhookUrl } = req.body;

  // In-memory update — will reset on server restart
  process.env.WEATHER_API_KEY = weatherApiKey;
  process.env.TELEGRAM_BOT_TOKEN = telegramBotToken;
  process.env.WEBHOOK_URL = webhookUrl;

  console.log('⚙️ Environment variables updated via admin panel (in-memory only)');

  res.redirect('/admin/settings');
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

module.exports = router;
