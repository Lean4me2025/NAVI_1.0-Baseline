/* NAVI Baseline 1.0 — hash-router SPA with three pages */
(function(){
  const app = document.getElementById('app');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const routes = {
    '/welcome': renderWelcome,
    '/strategy': renderStrategy,
    '/dashboard': renderDashboard,
  };

  function setActive(linkId){
    document.querySelectorAll('.top-nav a').forEach(a=>a.classList.remove('active'));
    const el = document.getElementById(linkId);
    if (el) el.classList.add('active');
  }

  function navigate(hash){
    const path = (hash || '#/welcome').replace('#','');
    const view = routes[path] || renderWelcome;
    // set active by mapping
    const linkMap = {'/welcome':'nav-welcome','/strategy':'nav-strategy','/dashboard':'nav-dashboard'};
    setActive(linkMap[path] || 'nav-welcome');
    app.innerHTML = view();
    wireActions();
    window.scrollTo({top:0,behavior:'instant'});
  }

  function wireActions(){
    const toStrategy = document.getElementById('to-strategy');
    if (toStrategy) toStrategy.addEventListener('click', ()=>{location.hash = '#/strategy';});

    const toDashboard = document.getElementById('to-dashboard');
    if (toDashboard) toDashboard.addEventListener('click', ()=>{location.hash = '#/dashboard';});

    const upgradeBtn = document.getElementById('upgrade-btn');
    if (upgradeBtn){
      const url = (window.NAVI_CONFIG && NAVI_CONFIG.NOVA_OFFERS_URL || '').trim();
      if (url){
        upgradeBtn.disabled = false;
        upgradeBtn.classList.remove('link');
        upgradeBtn.addEventListener('click', ()=>{ window.location.href = url; });
      } else {
        upgradeBtn.disabled = true;
        upgradeBtn.classList.add('link');
        const note = document.getElementById('upgrade-note');
        if (note){
          note.textContent = 'Set NOVA_OFFERS_URL in assets/js/data.js to enable upgrades.';
        }
      }
    }
  }

  function renderWelcome(){
    return `
      <section class="card">
        <span class="badge">Welcome</span>
        <h1>Welcome to NAVI</h1>
        <p>Navi turns your Nova insights into a focused, step-by-step plan — from strategy to tools that get results.</p>
        <div class="row" style="margin-top:12px">
          <button class="btn ok" id="to-strategy">Start My Strategy</button>
          <a class="btn secondary" href="#/dashboard">Skip to Dashboard</a>
        </div>
      </section>

      <section class="card">
        <h2>What you’ll do here</h2>
        <div class="list two">
          <div class="item">
            <strong>Connect Purpose → Roles</strong>
            <p class="muted">We align your strengths with roles where you’re already a fit.</p>
          </div>
          <div class="item">
            <strong>Plan the Path</strong>
            <p class="muted">Close gaps with training and milestones — paced to your season.</p>
          </div>
          <div class="item">
            <strong>Build the Tools</strong>
            <p class="muted">Resume, letters, and targeted outreach that speak your value.</p>
          </div>
          <div class="item">
            <strong>Take Action</strong>
            <p class="muted">Track applications → interviews → offers with clarity.</p>
          </div>
        </div>
      </section>
    `;
  }

  function renderStrategy(){
    return `
      <section class="card">
        <span class="badge">Strategy</span>
        <h1>Five W’s + How</h1>
        <div class="list two" style="margin-top:12px">
          <div class="item"><strong>Who</strong><p>Rooted in Nova traits.</p></div>
          <div class="item"><strong>What</strong><p>Roles that fit your strengths.</p></div>
          <div class="item"><strong>Why</strong><p>Motivation and legacy that fuel persistence.</p></div>
          <div class="item"><strong>When</strong><p>Timing, training gaps, market cycles.</p></div>
          <div class="item"><strong>Where</strong><p>Location and relocation considerations.</p></div>
          <div class="item"><strong>How</strong><p>Using Navi’s tools with purpose.</p></div>
        </div>
        <div class="row" style="margin-top:16px">
          <button class="btn" id="to-dashboard">Go to My Dashboard</button>
          <a class="btn secondary" href="#/welcome">Back</a>
        </div>
      </section>

      <section class="card">
        <h2>Reality Check Stats</h2>
        <div class="kpi"><span class="dot"></span><strong>Interviews follow persistence</strong> — consistent, targeted applications beat scatter-shot.</div>
        <div class="kpi"><span class="dot" style="background:var(--accent-2)"></span><strong>Track ratios</strong> — apps → interviews → offers. Improve one, the rest improve.</div>
      </section>
    `;
  }

  function renderDashboard(){
    return `
      <section class="card">
        <span class="badge">Dashboard</span>
        <h1>Your Action Center</h1>
        <p>Nova results + your reflection will appear here to guide priorities.</p>
        <div class="list three" style="margin-top:12px">
          <div class="item"><strong>Resume Builder</strong><p>Tailored to roles you select.</p></div>
          <div class="item"><strong>Cover Letters</strong><p>Aligned to your strengths.</p></div>
          <div class="item"><strong>Company Intel</strong><p>Focus research where it counts.</p></div>
        </div>
      </section>

      <section class="card">
        <h2>Need more features?</h2>
        <p id="upgrade-note">Upgrade path available.</p>
        <button class="btn warn" id="upgrade-btn">Update My Plan</button>
      </section>
    `;
  }

  // initial nav
  window.addEventListener('hashchange', ()=>navigate(location.hash));
  navigate(location.hash);
})();
