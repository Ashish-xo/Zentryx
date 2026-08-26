// Weather services — ported from original
import weatherCodes from '../data/weatherCodes';

const DEFAULT_COORDS = { lat: 31.6340, lon: 74.8723, label: 'Amritsar (GPS off)' };

export async function fetchWeatherForCity(question) {
  const q = question.toLowerCase();
  const cityMap = {
    amritsar: { name: 'Amritsar', lat: 31.6340, lon: 74.8723 },
    shimla: { name: 'Shimla', lat: 31.1048, lon: 77.1734 },
    delhi: { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
    mumbai: { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    goa: { name: 'Goa', lat: 15.2993, lon: 74.1240 },
    jaipur: { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
    manali: { name: 'Manali', lat: 32.2432, lon: 77.1892 },
    kasol: { name: 'Kasol', lat: 32.0096, lon: 77.3151 },
    udaipur: { name: 'Udaipur', lat: 24.5854, lon: 73.7125 },
    varanasi: { name: 'Varanasi', lat: 25.3176, lon: 82.9739 },
    kerala: { name: 'Kerala', lat: 10.8505, lon: 76.2711 },
    chennai: { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
    bangalore: { name: 'Bangalore', lat: 12.9716, lon: 77.5946 }
  };
  for (const [key, city] of Object.entries(cityMap)) {
    if (q.includes(key)) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
        const d = await fetchOpenMeteo(url);
        const w = weatherCodes[d.current?.weather_code] || 'Unknown';
        return `Current weather in ${city.name}: ${d.current?.temperature_2m ?? '--'}°C, ${w}. Humidity ${d.current?.relative_humidity_2m ?? '--'}%, Wind ${d.current?.wind_speed_10m ?? '--'} km/h.`;
      } catch {
        return `I couldn't fetch live weather for ${city.name} right now — try again in a moment.`;
      }
    }
  }
  // No city in the question — fetch live weather for the user's area
  // (GPS when allowed, otherwise the default Amritsar coordinates).
  try {
    const area = await getWeatherForCurrentArea();
    const d = await fetchWeatherByCoords(area.lat, area.lon);
    const w = weatherCodes[d.current?.weather_code] || 'Unknown';
    return `Current weather in ${area.label}: ${d.current?.temperature_2m ?? '--'}°C, ${w}. Humidity ${d.current?.relative_humidity_2m ?? '--'}%, Wind ${d.current?.wind_speed_10m ?? '--'} km/h.`;
  } catch {
    return "I couldn't fetch live weather right now — try a city name like \"weather in Goa\".";
  }
}

async function fetchOpenMeteo(url, ms = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const r = await fetch(url, { signal: controller.signal });
    if (!r.ok) throw new Error('open-meteo HTTP ' + r.status);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
  return fetchOpenMeteo(url);
}

export async function getWeatherForCurrentArea() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(DEFAULT_COORDS);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'Your location' }),
      () => resolve(DEFAULT_COORDS),
      { timeout: 6000 }
    );
  });
}