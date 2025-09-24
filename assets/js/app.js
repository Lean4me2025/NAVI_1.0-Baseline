/* NAVI Baseline 1.4a — full pages + proper tiles + Intel persistence */
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
      const url = (NAVI_CONFIG && NAVI_CONFIG.NOVA_OFFERS_URL || '').trim();
      if (url){
        upgradeBtn.disabled = false;
        upgradeBtn.classList.remove('link');
        upgradeBtn.addEventListener('click', ()=>{ window.location.href = url; });
      } else {
        upgradeBtn.disabled = true;
        upgradeBtn.classList.add('link');
        const note = document.getElementById('upgrade-note');
        if (note){ note.textContent = 'Set NOVA_OFFERS_URL in assets/js/data.js to enable upgrades.'; }
      }
    }

    // Tiles
    const rbTile = document.getElementById('tile-resume');
    const clTile = document.getElementById('tile-letter');
    const ciTile = document.getElementById('tile-intel');
    if (rbTile) rbTile.addEventListener('click', ()=>toggleSection('section-resume'));
    if (clTile) clTile.addEventListener('click', ()=>toggleSection('section-letter'));
    if (ciTile) ciTile.addEventListener('click', ()=>toggleSection('section-intel'));

    // Resume & Letter
    const rTA = document.getElementById('resume-text');
    const lTA = document.getElementById('letter-text');
    if (rTA){
      rTA.value = localStorage.getItem(KEYS.RESUME_TEXT) || '';
      updateTS('resume-ts', KEYS.RESUME_TS);
      document.getElementById('save-resume').addEventListener('click', ()=>{
        localStorage.setItem(KEYS.RESUME_TEXT, rTA.value);
        localStorage.setItem(KEYS.RESUME_TS, new Date().toLocaleString());
        updateTS('resume-ts', KEYS.RESUME_TS);
      });
      document.getElementById('dl-resume').addEventListener('click', ()=>downloadText(rTA.value, 'resume.txt'));
      document.getElementById('pdf-resume').addEventListener('click', ()=>downloadText(rTA.value, 'resume.pdf'));
    }
    if (lTA){
      lTA.value = localStorage.getItem(KEYS.LETTER_TEXT) || '';
      updateTS('letter-ts', KEYS.LETTER_TS);
      document.getElementById('save-letter').addEventListener('click', ()=>{
        localStorage.setItem(KEYS.LETTER_TEXT, lTA.value);
        localStorage.setItem(KEYS.LETTER_TS, new Date().toLocaleString());
        updateTS('letter-ts', KEYS.LETTER_TS);
      });
      document.getElementById('dl-letter').addEventListener('click', ()=>downloadText(lTA.value, 'cover-letter.txt'));
      document.getElementById('pdf-letter').addEventListener('click', ()=>downloadText(lTA.value, 'cover-letter.pdf'));
    }

    // Upload preview
    const upload = document.getElementById('resume-upload');
    if (upload){
      upload.addEventListener('change', (e)=>{
        const list = document.getElementById('file-list');
        list.innerHTML = '';
        Array.from(e.target.files).forEach(f=>{
          const li = document.createElement('div');
          li.className = 'item';
          li.textContent = f.name + ' (' + Math.round(f.size/1024) + ' KB)';
          list.appendChild(li);
        });
      });
    }

    // Clear All Drafts
    const clearAll = document.getElementById('clear-all');
    if (clearAll){
      clearAll.addEventListener('click', ()=>{
        localStorage.removeItem(KEYS.RESUME_TEXT);
        localStorage.removeItem(KEYS.LETTER_TEXT);
        localStorage.removeItem(KEYS.RESUME_TS);
        localStorage.removeItem(KEYS.LETTER_TS);
        alert('All resume/letter drafts cleared.');
        const r = document.getElementById('resume-text'); const l = document.getElementById('letter-text');
        if (r) r.value = ''; if (l) l.value = '';
        updateTS('resume-ts', KEYS.RESUME_TS); updateTS('letter-ts', KEYS.LETTER_TS);
      });
    }

    // Company Intel persistence
    const intelForm = {
      company: document.getElementById('intel-company'),
      role:    document.getElementById('intel-role'),
      notes:   document.getElementById('intel-notes'),
      addBtn:  document.getElementById('intel-add'),
      clearBtn:document.getElementById('intel-clear')
    };
    if (intelForm.addBtn){
      intelForm.addBtn.addEventListener('click', ()=>{
        const c = (intelForm.company.value || '').trim();
        const r = (intelForm.role.value || '').trim();
        const n = (intelForm.notes.value || '').trim();
        if (!c && !r && !n) return;
        const list = loadIntel();
        list.push({id:cryptoId(), company:c, role:r, notes:n, ts:new Date().toLocaleString()});
        saveIntel(list);
        intelForm.company.value = ''; intelForm.role.value=''; intelForm.notes.value='';
        renderIntelList();
      });
    }
    if (intelForm.clearBtn){
      intelForm.clearBtn.addEventListener('click', ()=>{
        if (confirm('Clear all saved Company Intel entries?')){
          saveIntel([]); renderIntelList();
        }
      });
    }
    renderIntelList();
  }

  function toggleSection(id){
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  function updateTS(id, key){
    const el = document.getElementById(id);
    if (el) el.textContent = localStorage.getItem(key) || 'Not saved';
  }

  function downloadText(text, filename){
    const blob = new Blob([text], {type:'application/octet-stream'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // Company Intel helpers
  function loadIntel(){
    try { return JSON.parse(localStorage.getItem(KEYS.INTEL_LIST) || '[]'); }
    catch(e){ return []; }
  }
  function saveIntel(list){
    localStorage.setItem(KEYS.INTEL_LIST, JSON.stringify(list));
  }
  function cryptoId(){ return 'id-' + Math.random().toString(36).slice(2,9); }

  function renderIntelList(){
    const listEl = document.getElementById('intel-list');
    if (!listEl) return;
    const list = loadIntel();
    if (list.length === 0){
      listEl.innerHTML = '<p style="opacity:.85">No companies saved yet.</p>';
      return;
    }
    listEl.innerHTML = `
      <div class="hdr">Saved Companies</div>
      <div class="table">
        ${list.map(item => `
          <div class="row">
            <div class="cell"><strong>${item.company || '-'}</strong></div>
            <div class="cell">${item.role || '-'}</div>
            <div class="cell">${(item.notes || '').replace(/</g,'&lt;')}</div>
            <div class="cell actions">
              <span style="opacity:.7;margin-right:auto">${item.ts}</span>
              <button class="btn secondary" data-del="${item.id}">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    // bind delete buttons
    listEl.querySelectorAll('[data-del]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-del');
        const next = loadIntel().filter(x=>x.id !== id);
        saveIntel(next); renderIntelList();
      });
    });
  }

  // RENDERERS
  function renderWelcome(){
    const traits = (window.NOVA_RESULTS && window.NOVA_RESULTS.traits) || [];
    const roles  = (window.NOVA_RESULTS && window.NOVA_RESULTS.alignedRoles) || [];
    const traitsHtml = traits.map(t=>`<span class="badge" style="margin:4px 6px 0 0">${t}</span>`).join(' ');
    const rolesHtml = roles.map(r=>`<div class="item"><strong>${r}</strong><p>High alignment based on your Nova profile.</p></div>`).join('');

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
        <h2>Your Traits</h2>
        <div>${traitsHtml || '<p>No traits available yet.</p>'}</div>
      </section>

      <section class="card">
        <h2>Aligned Roles</h2>
        <div class="list two">
          ${rolesHtml || '<div class="item"><p>No roles available yet.</p></div>'}
        </div>
      </section>

      <section class="card">
        <h2>What you’ll do here</h2>
        <div class="list two">
          <div class="item">
            <strong>Connect Purpose → Roles</strong>
            <p>We align your strengths with roles where you’re already a fit.</p>
          </div>
          <div class="item">
            <strong>Plan the Path</strong>
            <p>Close gaps with training and milestones — paced to your season.</p>
          </div>
          <div class="item">
            <strong>Build the Tools</strong>
            <p>Letters first, then resumes — crafted to speak your value.</p>
          </div>
          <div class="item">
            <strong>Take Action</strong>
            <p>Track applications → interviews → offers with clarity.</p>
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
        <div class="steps" style="margin-top:14px">
          <div class="wall"></div>
          <div class="step s1"><div class="label">Step 1 — Who</div><div class="sub">Rooted in Nova traits.</div></div>
          <div class="step s2"><div class="label">Step 2 — What</div><div class="sub">Roles that fit your strengths.</div></div>
          <div class="step s3"><div class="label">Step 3 — Why</div><div class="sub">Motivation & legacy that fuel persistence.</div></div>
          <div class="step s4"><div class="label">Step 4 — When / Where / How</div><div class="sub">Timing, location, and tools for the path.</div></div>
        </div>
        <div class="row" style="margin-top:16px">
          <button class="btn" id="to-dashboard">Go to My Dashboard</button>
          <a class="btn secondary" href="#/welcome">Back</a>
        </div>
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
          <div class="tile" id="tile-resume">
            <div class="title">📄 Resume Builder</div>
            <div class="subtitle">Upload, draft, save, download.</div>
          </div>
          <div class="tile" id="tile-letter">
            <div class="title">✉️ Cover Letters</div>
            <div class="subtitle">Draft, save, download.</div>
          </div>
          <div class="tile" id="tile-intel">
            <div class="title">🔍 Company Intel</div>
            <div class="subtitle">Track companies, roles, notes.</div>
          </div>
        </div>
      </section>

      <section class="card section" id="section-resume">
        <h2>Resume Builder</h2>
        <div class="tools" style="margin-top:12px">
          <div class="tool">
            <h3>Upload Resume</h3>
            <p>Select a file to add it to your workspace.</p>
            <div class="actions">
              <input class="input" id="resume-upload" type="file" accept=".pdf,.doc,.docx,.txt" />
            </div>
            <div id="file-list" class="list" style="margin-top:10px"></div>
          </div>
          <div class="tool">
            <h3>Draft Text</h3>
            <p>Paste or type your resume content, then save or download.</p>
            <textarea id="resume-text" class="input" rows="10" placeholder="Paste or write your resume here..."></textarea>
            <p>Last saved: <span id="resume-ts">Not saved</span></p>
            <div class="actions" style="margin-top:8px">
              <button id="save-resume" class="btn ok" type="button">Save Draft</button>
              <button id="dl-resume" class="btn" type="button">Download TXT</button>
              <button id="pdf-resume" class="btn secondary" type="button">Download PDF</button>
            </div>
          </div>
        </div>
      </section>

      <section class="card section" id="section-letter">
        <h2>Cover Letters</h2>
        <div class="tools" style="margin-top:12px">
          <div class="tool">
            <h3>Draft Text</h3>
            <p>Write or paste a cover letter to save and download.</p>
            <textarea id="letter-text" class="input" rows="10" placeholder="Write your cover letter here..."></textarea>
            <p>Last saved: <span id="letter-ts">Not saved</span></p>
            <div class="actions" style="margin-top:8px">
              <button id="save-letter" class="btn ok" type="button">Save Draft</button>
              <button id="dl-letter" class="btn" type="button">Download TXT</button>
              <button id="pdf-letter" class="btn secondary" type="button">Download PDF</button>
            </div>
          </div>
        </div>
      </section>

      <section class="card section" id="section-intel">
        <h2>Company Intel</h2>
        <div class="tools" style="margin-top:12px">
          <div class="tool">
            <h3>Add Company</h3>
            <input id="intel-company" class="input" placeholder="Company name"/>
            <input id="intel-role" class="input" placeholder="Role"/>
            <textarea id="intel-notes" class="input" rows="5" placeholder="Notes…"></textarea>
            <div class="actions" style="margin-top:8px">
              <button id="intel-add" class="btn ok" type="button">Add</button>
              <button id="intel-clear" class="btn warn" type="button">Clear All</button>
            </div>
          </div>
          <div class="tool" style="flex:2 1 400px">
            <h3>Saved</h3>
            <div id="intel-list"></div>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="actions">
          <button id="clear-all" class="btn warn" type="button">Clear All Drafts</button>
        </div>
      </section>

      <section class="card">
        <h2>Need more features?</h2>
        <p id="upgrade-note">Upgrade path available.</p>
        <button class="btn link" id="upgrade-btn">Update My Plan</button>
      </section>
    `;
  }

  // Helpers
  window.addEventListener('hashchange', ()=>navigate(location.hash));
  navigate(location.hash);
})();
