const axios = require('axios');

module.exports = async function fetchWeather(lat, lon) {
  const apiKey = process.env.WEATHER_API_KEY;
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        lat,
        lon,
        units: 'metric',
        appid: apiKey
      }
    });

    const data = response.data;
    return `📍 *${data.name}*
🌡️ Temp: ${data.main.temp}°C
🌤️ ${data.weather[0].description}`;
  } catch (err) {
    console.error('Failed to fetch weather:', err.message);
    return '⚠️ Could not fetch weather data.';
  }
};
