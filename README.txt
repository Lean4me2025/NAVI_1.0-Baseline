
# Nova → Navi Integrated Flow (v1.4c)

This package implements a clean, integrated flow:
**Welcome → Traits → Results → Reflection → Review Plans**

- The **Payhip embeds and plan info appear ONLY on `review-plans.html`** (per your direction).
- **Mastery** is the label shown on the page, but its button is wired to the **Pro Suite** Payhip product ID `re4Hy`.
- Starter and Book are fully wired:
  - Starter → `GdfU7`
  - Book → `N7Lvg`
- **Pro plan** is included but its Payhip ID is not yet provided — the button is disabled to avoid broken flows.

## Update the Pro Plan ID
1. Open `review-plans.html`.
2. Find the section labeled “NAVI Pro Plan”.
3. Replace:
   - `TODO_PRO_ID` with your real Payhip ID (e.g., `AbC12`).
   - Replace the disabled `<button>` with the standard Payhip anchor:
     ```html
     <a href="https://payhip.com/b/AbC12" class="payhip-buy-button" data-theme="green" data-product="AbC12">Buy Now</a>
     ```
4. Keep the Payhip script tag at the top of `review-plans.html` — it should only appear once on this page.

## Files
- `index.html` → Welcome
- `traits.html` → Select traits (stores to localStorage)
- `results.html` → Shows selected traits
- `reflection.html` → Choose starting point; “Review Plans” button
- `review-plans.html` → Tabs: Book + Plans; **only page with Payhip embeds**
- `assets/styles.css`, `assets/app.js` → shared styling & logic

Deploy the whole folder as-is. Entry point is `index.html`.


## Login / Exit (v1.5)

- **Exit:** Click "Exit" in the top-right. This logs you out and clears session data, then sends you to `exit.html`.
- **Login:** Use `login.html` to set your email and restore any progress saved on this device; then go to `dashboard.html`.
- **Save Progress:** On the dashboard, click "Save Progress" to persist your traits & reflection for this device.

### Cross-device logins (next step)
To enable secure logins and resume across devices, connect an auth backend (e.g., Supabase):
1. Create a Supabase project → enable **Email magic link**.
2. Replace the `login()` and `logout()` helpers in `assets/app.js` with Supabase Auth calls.
3. Store profile/progress in a Supabase table keyed by `user_id`.
4. Remove the device-only notice on `login.html` once live.



## v1.6 — Email + PIN (local encryption)

- **Login:** Email + 4–6 digit PIN. New users create a PIN; returning users verify with the same PIN.
- **Encryption:** Progress (traits + reflection) is encrypted with **AES‑GCM**. The key is derived from **email + PIN** via **PBKDF2 (SHA‑256, 100k iterations)**.
- **Storage:** LocalStorage contains only a salted verifier hash and the encrypted payload — no plaintext traits/reflection.
- **Exit:** Clears the active session. Use **Login** to re-enter; enter the same email + PIN to decrypt.
- **Forgot PIN:** Use “Wipe & reset” on the Login page to remove local data for that email on this device.

### Security & Limits
- This protects privacy on shared/public machines but remains **device-specific**. To sync across devices and support PIN resets, integrate a backend (e.g., Supabase Auth + DB). The code is modular to swap in real auth.


## v1.6.1 — First-login PIN guidance
- The Login page now clearly prompts NEW users to **create a 4–6 digit PIN** the first time they use an email on a device.
- Returning users see guidance to **enter their existing PIN**.
- After first PIN creation, a confirmation alert reminds users to keep it private.
