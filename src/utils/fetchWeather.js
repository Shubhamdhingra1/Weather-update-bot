const axios = require('axios');

module.exports = async function fetchWeather(lat, lon) {
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    console.error('❌ WEATHER_API_KEY is missing in environment variables');
    return '⚠️ Weather API key is not configured.';
  }

  // ✅ Validate coordinates
  if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) {
    console.error('❌ Invalid latitude or longitude:', lat, lon);
    return '⚠️ Location is not set properly. Please send your 📍 location again.';
  }

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        units: 'metric',
        appid: apiKey
      }
    });

    const data = response.data;

    const city = data?.name || 'Unknown Location';
    const temp = data?.main?.temp ?? 'N/A';
    const feelsLike = data?.main?.feels_like ?? 'N/A';
    const humidity = data?.main?.humidity ?? 'N/A';
    const windSpeed = data?.wind?.speed ?? 'N/A';
    const description = data?.weather?.[0]?.description || 'No description available';

    return `📍 *${escapeMarkdown(city)}*
🌡️ Temp: *${temp}°C* (Feels like: *${feelsLike}°C*)
💧 Humidity: *${humidity}%*
💨 Wind: *${windSpeed} m/s*
🌤️ ${escapeMarkdown(capitalize(description))}`;
    
  } catch (err) {
    console.error('❌ Failed to fetch weather:', err.response?.data || err.message);
    return '⚠️ Could not fetch weather data at the moment.';
  }
};

// Escape Markdown for Telegram
function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

// Capitalize first letter of description
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
