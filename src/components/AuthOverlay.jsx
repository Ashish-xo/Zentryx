import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getUsers, saveUsers, verifyPassword, loginLocked, recordLoginAttempt, createUser, setSession as persistSession } from '../lib/auth';

export default function AuthOverlay() {
  const { state, setAuthVisible, setSession, setAuthError, addLog } = useApp();
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  if (!state.authVisible) return null;

  const showError = (msg) => setErr(msg);

  const doLogin = async () => {
    setErr('');
    if (loginLocked(email)) return showError('Too many attempts. Try again in 30 seconds.');
    const users = getUsers();
    const u = users.find(x => x.email === email.toLowerCase());
    if (!u) return showError('Invalid credentials. Try again or create an account.');
    if (!(await verifyPassword(u, pass))) {
      recordLoginAttempt(email);
      return showError('Invalid credentials. Try again or create an account.');
    }
    setSession(u);
    setAuthVisible(false);
    addLog(`${u.name} authenticated. Welcome to the network.`);
  };

  const doSignup = async () => {
    setErr('');
    if (name.trim().length < 2) return showError('Enter a display name.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return showError('Enter a valid email.');
    if (pass.length < 6) return showError('Password must be at least 6 characters.');
    const users = getUsers();
    if (users.some(x => x.email === email.toLowerCase())) return showError('An account with this email already exists. Sign in instead.');
    const u = await createUser(name.trim(), email.toLowerCase(), pass);
    users.push(u);
    saveUsers(users);
    setSession(u);
    setAuthVisible(false);
    addLog(`${u.name} joined the network. Welcome!`);
  };

  return (
    <div id="auth-overlay" className="fixed inset-0 z-[2000] bg-[#040816]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-frontier border border-frontier-indigo/30 p-8" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-8">
          <div className="text-2xl font-black tracking-widest text-frontier-indigo mb-2">ZENTRYX</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-frontier-text">Access the network</div>
        </div>
        <div className="flex mb-6 border border-frontier-indigo/20">
          <button onClick={() => { setTab('login'); setErr(''); }}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest ${tab === 'login' ? 'bg-frontier-indigo text-frontier-deep' : 'text-frontier-indigo hover:bg-frontier-indigo/10'}`}>Sign In</button>
          <button onClick={() => { setTab('signup'); setErr(''); }}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest ${tab === 'signup' ? 'bg-frontier-indigo text-frontier-deep' : 'text-frontier-indigo hover:bg-frontier-indigo/10'}`}>Create Account</button>
        </div>

        {tab === 'login' ? (
          <div className="space-y-4">
            <input type="email" placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-frontier-deep border border-frontier-indigo/30 p-3 text-xs text-white placeholder-frontier-text/40 focus:border-frontier-lime outline-none" />
            <input type="password" placeholder="PASSWORD" value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doLogin()}
              className="w-full bg-frontier-deep border border-frontier-indigo/30 p-3 text-xs text-white placeholder-frontier-text/40 focus:border-frontier-lime outline-none" />
            <button onClick={doLogin} className="w-full bg-frontier-indigo text-white py-3 text-[10px] font-black uppercase tracking-widest hover:brightness-110">Sign In</button>
          </div>
        ) : (
          <div className="space-y-4">
            <input type="text" placeholder="DISPLAY NAME" value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-frontier-deep border border-frontier-indigo/30 p-3 text-xs text-white placeholder-frontier-text/40 focus:border-frontier-lime outline-none" />
            <input type="email" placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-frontier-deep border border-frontier-indigo/30 p-3 text-xs text-white placeholder-frontier-text/40 focus:border-frontier-lime outline-none" />
            <input type="password" placeholder="PASSWORD" value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSignup()}
              className="w-full bg-frontier-deep border border-frontier-indigo/30 p-3 text-xs text-white placeholder-frontier-text/40 focus:border-frontier-lime outline-none" />
            <button onClick={doSignup} className="w-full bg-frontier-indigo text-white py-3 text-[10px] font-black uppercase tracking-widest hover:brightness-110">Create Account</button>
          </div>
        )}

        {err && <div className="mt-4 text-red-400 text-[10px] uppercase tracking-widest text-center">{err}</div>}
        <div className="mt-6 text-center">
          <button onClick={() => setAuthVisible(false)}
            className="text-frontier-text/40 text-[9px] uppercase tracking-widest hover:text-frontier-indigo transition-colors">
            Skip for now — browse as guest
          </button>
        </div>
      </div>
    </div>
  );
}