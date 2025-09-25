
/* Shared flow state via localStorage */
const LS_KEYS = {
  TRAITS: 'nova_traits',
  REFLECTION: 'nova_reflection'
};

export function saveTraits(traits) {
  localStorage.setItem(LS_KEYS.TRAITS, JSON.stringify(traits || []));
}

export function readTraits() {
  try { return JSON.parse(localStorage.getItem(LS_KEYS.TRAITS) || '[]'); } catch { return []; }
}

export function saveReflection(value) {
  localStorage.setItem(LS_KEYS.REFLECTION, value || '');
}

export function readReflection() {
  return localStorage.getItem(LS_KEYS.REFLECTION) || '';
}

export function go(href) {
  window.location.href = href;
}


// --- Crypto utilities (Web Crypto) ---
// Derive a CryptoKey from email + PIN using PBKDF2
async function deriveKey(email, pin, saltBytes){
  const enc = new TextEncoder();
  const base = enc.encode((email||'') + '|' + (pin||''));
  const keyMaterial = await crypto.subtle.importKey('raw', base, {name:'PBKDF2'}, false, ['deriveKey','deriveBits']);
  return await crypto.subtle.deriveKey(
    { name:'PBKDF2', salt: saltBytes, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name:'AES-GCM', length: 256 },
    false,
    ['encrypt','decrypt']
  );
}

function b64(bytes){ return btoa(String.fromCharCode(...new Uint8Array(bytes))); }
function ub64(str){ return Uint8Array.from(atob(str), c=>c.charCodeAt(0)); }

async function sha256(str){
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
  return b64(buf);
}

function randomBytes(length){
  const b = new Uint8Array(length);
  crypto.getRandomValues(b);
  return b;
}

// Encrypt JSON using AES-GCM with derived key
async function encryptProgress(email, pin, saltB, dataObj){
  const key = await deriveKey(email, pin, saltB);
  const iv = randomBytes(12);
  const enc = new TextEncoder();
  const plaintext = enc.encode(JSON.stringify(dataObj));
  const cipher = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, plaintext);
  return { iv: b64(iv), ciphertext: b64(cipher) };
}

async function decryptProgress(email, pin, saltB, payload){
  const key = await deriveKey(email, pin, saltB);
  const iv = ub64(payload.iv);
  const cipherBytes = ub64(payload.ciphertext);
  const plainBuf = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, cipherBytes);
  const dec = new TextDecoder();
  return JSON.parse(dec.decode(plainBuf));
}

// --- Protected local account storage ---
const ACC_PREFIX = 'navi_account_'; // stores per-email auth + encrypted progress
function accKey(email){ return ACC_PREFIX + (email||''); }

function loadAccount(email){
  try { return JSON.parse(localStorage.getItem(accKey(email))||'null'); } catch { return null; }
}
function saveAccount(email, obj){
  localStorage.setItem(accKey(email), JSON.stringify(obj||{}));
}

// Create or verify a PIN for an email. Stores salt + verifierHash.
export async function setupOrVerifyPIN(email, pin){
  const acc = loadAccount(email);
  const salt = acc?.salt ? ub64(acc.salt) : randomBytes(16);
  const verifier = await sha256(email + '|' + pin + '|' + b64(salt));
  if(!acc){
    // New account
    saveAccount(email, { salt: b64(salt), verifierHash: verifier, encProgress: null });
    return { ok: true, created: true };
  } else {
    // Verify
    if(acc.verifierHash === verifier){
      return { ok: true, created: false };
    } else {
      return { ok: false, created: false };
    }
  }
}

// Save encrypted progress bound to (email + pin)
export async function secureSaveProgress(email, pin, payload){
  const acc = loadAccount(email);
  if(!acc) throw new Error('No account for email.');
  const saltB = ub64(acc.salt);
  const enc = await encryptProgress(email, pin, saltB, payload);
  acc.encProgress = enc;
  saveAccount(email, acc);
}

// Load & decrypt progress; returns null if none
export async function secureLoadProgress(email, pin){
  const acc = loadAccount(email);
  if(!acc || !acc.encProgress) return null;
  const saltB = ub64(acc.salt);
  try {
    return await decryptProgress(email, pin, saltB, acc.encProgress);
  } catch (e){
    throw new Error('Decryption failed (wrong PIN?).');
  }
}

// Wipe account (e.g., forgot PIN)
export function wipeAccount(email){
  localStorage.removeItem(accKey(email));
}

// --- Auth session state (email + pin) ---
const SESSION_KEY_EMAIL = 'navi_user_email';
const SESSION_KEY_PINSET = 'navi_user_pin_set'; // '1' if PIN validated this session

export function currentUserEmail(){
  return localStorage.getItem(SESSION_KEY_EMAIL) || '';
}

export function setSession(email){
  localStorage.setItem(SESSION_KEY_EMAIL, email);
  localStorage.setItem(SESSION_KEY_PINSET, '1');
}

export function sessionValid(){
  return currentUserEmail() && localStorage.getItem(SESSION_KEY_PINSET) === '1';
}

export function clearSession(){
  localStorage.removeItem(SESSION_KEY_EMAIL);
  localStorage.removeItem(SESSION_KEY_PINSET);
}

export function logout(){
  clearSession();
  // Clear volatile flow
  localStorage.removeItem(LS_KEYS.TRAITS);
  localStorage.removeItem(LS_KEYS.REFLECTION);
  window.location.href = 'exit.html';
}

// Device-only save/restore remains for UX, but we now prefer secureSaveProgress for user-bound saves.
export async function saveUserProgress(){
  const email = currentUserEmail();
  if(!sessionValid()){ alert('Please login first.'); return; }
  const traits = readTraits();
  const reflection = readReflection();
  const payload = { traits, reflection, savedAt: new Date().toISOString() };
  // Ask for PIN for encryption this time
  const pin = prompt('Enter your 6-digit PIN to save:');
  if(!pin || pin.length < 4){ alert('Save cancelled.'); return; }
  await secureSaveProgress(email, pin, payload);
  alert('Progress encrypted and saved for this account on this device.');
}

export async function restoreIfAny(){
  const email = currentUserEmail();
  if(!email) return false;
  const acc = (function(){ try { return JSON.parse(localStorage.getItem('navi_account_' + email)||'null'); } catch { return null; } })();
  if(!acc || !acc.encProgress) return false;
  const pin = prompt('Enter your 6-digit PIN to restore:');
  if(!pin || pin.length < 4) { alert('Restore cancelled.'); return false; }
  try {
    const data = await secureLoadProgress(email, pin);
    if(data?.traits) localStorage.setItem(LS_KEYS.TRAITS, JSON.stringify(data.traits));
    if(data?.reflection) localStorage.setItem(LS_KEYS.REFLECTION, data.reflection);
    return true;
  } catch(e){
    alert('Could not restore: ' + e.message);
    return false;
  }
}
