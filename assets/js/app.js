(function(){
const app=document.getElementById('app');document.getElementById('year').textContent=new Date().getFullYear();
const routes={'/welcome':renderWelcome,'/strategy':renderStrategy,'/dashboard':renderDashboard};
function navigate(hash){const path=(hash||"#/welcome").replace("#","");app.innerHTML=(routes[path]||renderWelcome)();wireActions();}
function wireActions(){
  if(document.getElementById('tile-resume'))document.getElementById('tile-resume').onclick=()=>toggle('section-resume');
  if(document.getElementById('tile-letter'))document.getElementById('tile-letter').onclick=()=>toggle('section-letter');
  if(document.getElementById('tile-intel'))document.getElementById('tile-intel').onclick=()=>toggle('section-intel');
  if(document.getElementById('tile-assess'))document.getElementById('tile-assess').onclick=()=>toggle('section-assess');
}
function toggle(id){document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');}
function renderWelcome(){return `<section class="card"><span class="badge">Welcome</span><h1>Welcome to NAVI</h1></section>`;}
function renderStrategy(){return `<section class="card"><span class="badge">Strategy</span><h1>Five W’s + How</h1></section>`;}
function renderDashboard(){return `
<section class="card"><h1>Dashboard</h1><h2>Your Action Center</h2></section>
<section class="card">
<div class="tile" id="tile-resume">📄 Resume Builder</div>
<div class="tile" id="tile-letter">✉️ Cover Letters</div>
<div class="tile" id="tile-intel">🔍 Company Intel (placeholder)</div>
<div class="tile" id="tile-assess">📝 Assessment Prep (Coming Soon)</div>
</section>
<section class="card section" id="section-resume"><h2>Resume Builder</h2><p>Stub: JD input, Gap Analysis, Training suggestions, Export TXT/PDF/Word, Condensed vs Full choice</p>
<p><em>Disclaimer: NAVI builds resumes based on the information you provide and is not responsible for the accuracy or truthfulness.</em></p>
<p><em>Reality Check: Many employers now include an assessment test to verify the skills listed on your resume. Be prepared to pass these tests. Navi will provide practice questions and guidance.</em></p>
</section>
<section class="card section" id="section-letter"><h2>Cover Letters</h2><p>Stub: Generate or refine, Export TXT/PDF/Word</p></section>
<section class="card section" id="section-intel"><h2>Company Intel</h2><p>Placeholder: Company intel will appear once a target employer is selected.</p></section>
<section class="card section" id="section-assess"><h2>Assessment Prep</h2><p>Coming Soon: Practice questions and tips to prepare for employer skill tests.</p></section>`;}
window.addEventListener('hashchange',()=>navigate(location.hash));navigate(location.hash);
})();