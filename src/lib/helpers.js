// Ported from original inline script — pure helpers, no React deps

export const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const jsStr = (s) => {
  if (!s) return '';
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
};

export const safeHttpUrl = (url) => {
  if (!url) return '#';
  return /^https?:\/\//i.test(url) ? url : '#';
};

export const safeMailHref = (email) => {
  if (!email) return '#';
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? `mailto:${email}` : '#';
};

export const safePhoneHref = (phone) => {
  if (!phone) return '#';
  return /^[+0-9 ()-]{6,}$/.test(String(phone).trim()) ? `tel:${phone}` : '#';
};

export const formatDistance = (km) => {
  if (km == null) return '—';
  return km >= 100 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
};

export const formatDuration = (mins) => {
  if (mins == null) return '—';
  if (mins < 60) return `${Math.round(mins)} min`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const getBearingLabel = (deg) => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
};

export const looksLikeQuestion = (text) => {
  if (!text) return false;
  const t = text.trim().toLowerCase();
  if (t.endsWith('?')) return true;
  return /^(what|who|where|when|why|how|which|can|could|is|are|do|does|should|tell|explain|describe|calculate|find|route|weather|budget|plan|best|nearest)\b/.test(t);
};

export const makeSalt = () => {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
};

export const hashPassLegacy = (pass) => {
  let h = 5381;
  for (let i = 0; i < pass.length; i++) h = ((h << 5) + h + pass.charCodeAt(i)) >>> 0;
  return 'legacy_' + h.toString(16);
};

export const hashPassSha256 = async (pass, salt) => {
  const data = new TextEncoder().encode(salt + ':' + pass);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
};

export const CRYPTO_OK = typeof crypto !== 'undefined' && crypto.subtle;

export const WMO_CODES = {
  0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Light showers', 81: 'Showers', 82: 'Violent showers', 95: 'Thunderstorm', 96: 'Storm w/ hail', 99: 'Severe storm'
};