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
  res.render('admin/login');
});

// Login handler
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (username === process.env.ADMIN_USERNAME && 
      password === process.env.ADMIN_PASSWORD) {
    req.session.isAuthenticated = true;
    res.redirect('/admin/dashboard');
  } else {
    res.render('admin/login', { error: 'Invalid credentials' });
  }
});

// Dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const users = await User.find();
    res.render('admin/dashboard', { users });
  } catch (error) {
    res.status(500).send('Error fetching users');
  }
});

// Block/Unblock user
router.post('/user/:id/toggle-block', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.redirect('/admin/dashboard');
  } catch (error) {
    res.status(500).send('Error updating user');
  }
});

// Delete user
router.post('/user/:id/delete', isAuthenticated, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin/dashboard');
  } catch (error) {
    res.status(500).send('Error deleting user');
  }
});

// Settings page
router.get('/settings', isAuthenticated, (req, res) => {
  res.render('admin/settings', {
    weatherApiKey: process.env.WEATHER_API_KEY,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN
  });
});

// Update settings
router.post('/settings', isAuthenticated, async (req, res) => {
  const { weatherApiKey, telegramBotToken } = req.body;
  
  // Update environment variables
  process.env.WEATHER_API_KEY = weatherApiKey;
  process.env.TELEGRAM_BOT_TOKEN = telegramBotToken;
  
  res.redirect('/admin/settings');
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

module.exports = router; 