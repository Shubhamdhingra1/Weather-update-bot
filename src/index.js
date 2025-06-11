require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const cron = require('node-cron');
const fetchWeather = require('./utils/fetchWeather');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const URL = process.env.WEBHOOK_URL;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Session setup
app.use(session({
  secret: 'yourSecret',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
  }),
}));

// Express middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Homepage route
app.get('/', (req, res) => {
  res.send(`
    <h1>🤖 Weather Update Telegram Bot is Running!</h1>
    <p>To use this bot, open Telegram and search for your bot <b>@YourBotUsername</b>.</p>
    <p><strong>Available Commands:</strong></p>
    <ul>
      <li><code>/start</code> - Start interacting with the bot</li>
      <li><code>/subscribe</code> - Get daily weather updates</li>
      <li><code>/unsubscribe</code> - Stop weather updates</li>
      <li><code>/weather</code> - Get current weather at your location</li>
    </ul>
    <p>📍 Send your location in the chat for personalized forecasts.</p>
  `);
});

// Admin routes
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

// Telegram Bot Setup
const bot = new TelegramBot(TOKEN);

// ✅ Only setup webhook if URL is defined


// Telegram Handlers
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await User.findOneAndUpdate(
    { telegramId: chatId },
    {
      telegramId: chatId,
      username: msg.from.username || '',
      firstName: msg.from.first_name || '',
      lastName: msg.from.last_name || ''
    },
    { upsert: true, new: true }
  );

  bot.sendMessage(chatId, `Welcome to Weather Update Bot! 🌤

Available commands:
/subscribe - Get daily weather updates
/unsubscribe - Stop getting updates
/weather - Get current weather
📍 Send location to get personalized updates`);
});

bot.onText(/\/subscribe/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await User.findOneAndUpdate({ telegramId: chatId }, { isSubscribed: true }, { new: true });
  if (user?.location) {
    bot.sendMessage(chatId, '✅ Subscribed! You will receive daily weather updates.');
  } else {
    bot.sendMessage(chatId, '✅ Subscribed! Please send your 📍 location so we can send accurate updates.');
  }
});

bot.onText(/\/unsubscribe/, async (msg) => {
  const chatId = msg.chat.id;
  await User.findOneAndUpdate({ telegramId: chatId }, { isSubscribed: false });
  bot.sendMessage(chatId, '❌ You have been unsubscribed from weather updates.');
});

bot.onText(/\/weather/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await User.findOne({ telegramId: chatId });

  if (!user?.location) {
    return bot.sendMessage(chatId, '⚠️ Please send your 📍 location to receive weather updates.');
  }

  const weatherMessage = await fetchWeather(user.location.latitude, user.location.longitude);
  bot.sendMessage(chatId, weatherMessage, { parse_mode: 'Markdown' });
});

bot.on('location', async (msg) => {
  const chatId = msg.chat.id;
  const { latitude, longitude } = msg.location;
  const user = await User.findOneAndUpdate(
    { telegramId: chatId },
    { location: { latitude, longitude } },
    { new: true }
  );
  bot.sendMessage(chatId, '📍 Location saved! You will now receive accurate weather updates.');
});

// Cron: Send daily weather at 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Sending weather updates...');
  const users = await User.find({ isSubscribed: true, isBlocked: false });

  for (const user of users) {
    if (user.location?.latitude && user.location?.longitude) {
      const weatherMessage = await fetchWeather(user.location.latitude, user.location.longitude);
      bot.sendMessage(user.telegramId, weatherMessage, { parse_mode: 'Markdown' });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  if (URL) {
    bot.setWebHook(`${URL}/bot${TOKEN}`)
      .then(() => console.log('✅ Webhook set successfully'))
      .catch(err => console.error('❌ Failed to set webhook:', err.message));
  
    // Register webhook endpoint
    app.post(`/bot${TOKEN}`, (req, res) => {
      bot.processUpdate(req.body);
      res.sendStatus(200);
    });
  } else {
    console.warn('⚠️ WEBHOOK_URL not set. Skipping webhook setup.');
  }
});
