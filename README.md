# Weather Telegram Bot
Live Url - https://weather-update-bot.onrender.com
A Telegram bot that provides weather updates with an admin panel for managing users and settings.

## Features

- Weather updates subscription system
- Admin panel for user management
- API key management
- User blocking/unblocking functionality
- Secure authentication system

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Telegram Bot Token (from BotFather)
- OpenWeatherMap API Key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd weather-telegram-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
MONGODB_URI=mongodb://localhost:27017/weather-bot
WEATHER_API_KEY=your_openweathermap_api_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
SESSION_SECRET=your_session_secret
```

4. Start the application:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Usage

### Bot Commands

- `/start` - Start the bot and see available commands
- `/subscribe` - Subscribe to daily weather updates
- `/unsubscribe` - Unsubscribe from weather updates
- `/weather` - Get current weather for your location

### Admin Panel

Access the admin panel at `http://localhost:3000/admin`

Features:
- User management (view, block/unblock, delete)
- API key management
- Bot settings configuration


