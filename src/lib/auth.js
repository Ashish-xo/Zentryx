// Auth system — ported from original inline script
import { hashPassSha256, hashPassLegacy, makeSalt, CRYPTO_OK } from './helpers';

const STORAGE_KEY_USERS = 'zentryx_users';
const STORAGE_KEY_SESSION = 'zentryx_session';

export function getSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_SESSION) || 'null'); } catch { return null; }
}

export function setSession(user) {
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY_SESSION);
}

export function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]'); } catch { return []; }
}

export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

export async function verifyPassword(user, pass) {
  if (user.hash) {
    return (await hashPassSha256(pass, user.salt)) === user.hash;
  }
  if (user.passHash) {
    return hashPassLegacy(pass) === user.passHash;
  }
  return false;
}

const loginThrottle = {};

export function loginLocked(email) {
  const t = loginThrottle[email];
  if (t && Date.now() < t.until) return true;
  return false;
}

export function recordLoginAttempt(email) {
  const t = loginThrottle[email] = loginThrottle[email] || { count: 0, until: 0 };
  t.count++;
  if (t.count >= 5) {
    t.until = Date.now() + 30000;
    t.count = 0;
  }
}

export async function createUser(name, email, pass) {
  const salt = makeSalt();
  const user = { name, email, salt, joined: Date.now() };
  if (CRYPTO_OK) {
    user.hash = await hashPassSha256(pass, salt);
  } else {
    user.passHash = hashPassLegacy(pass);
    delete user.salt;
  }
  return user;
}