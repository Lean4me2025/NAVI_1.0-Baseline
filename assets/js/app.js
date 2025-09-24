(function(){
const app=document.getElementById('app');document.getElementById('year').textContent=new Date().getFullYear();
const routes={'/welcome':renderWelcome,'/strategy':renderStrategy,'/dashboard':renderDashboard};
function navigate(hash){const path=(hash||"#/welcome").replace("#","");app.innerHTML=(routes[path]||renderWelcome)();wireActions();}
function wireActions(){
 if(document.getElementById('tile-resume'))document.getElementById('tile-resume').onclick=()=>toggle('section-resume');
 if(document.getElementById('tile-letter'))document.getElementById('tile-letter').onclick=()=>toggle('section-letter');
 if(document.getElementById('tile-intel'))document.getElementById('tile-intel').onclick=()=>toggle('section-intel');
 let rTA=document.getElementById('resume-text');let lTA=document.getElementById('letter-text');
 if(rTA){rTA.value=localStorage.getItem(KEYS.RESUME_TEXT)||"";updateTS('resume-ts',KEYS.RESUME_TS);
  document.getElementById('save-resume').onclick=()=>{localStorage.setItem(KEYS.RESUME_TEXT,rTA.value);localStorage.setItem(KEYS.RESUME_TS,new Date().toLocaleString());updateTS('resume-ts',KEYS.RESUME_TS);};
  document.getElementById('dl-resume').onclick=()=>download(rTA.value,'resume.txt');
  document.getElementById('pdf-resume').onclick=()=>download(rTA.value,'resume.pdf');}
 if(lTA){lTA.value=localStorage.getItem(KEYS.LETTER_TEXT)||"";updateTS('letter-ts',KEYS.LETTER_TS);
  document.getElementById('save-letter').onclick=()=>{localStorage.setItem(KEYS.LETTER_TEXT,lTA.value);localStorage.setItem(KEYS.LETTER_TS,new Date().toLocaleString());updateTS('letter-ts',KEYS.LETTER_TS);};
  document.getElementById('dl-letter').onclick=()=>download(lTA.value,'cover-letter.txt');
  document.getElementById('pdf-letter').onclick=()=>download(lTA.value,'cover-letter.pdf');}
 if(document.getElementById('clear-all'))document.getElementById('clear-all').onclick=()=>{localStorage.clear();alert("All drafts cleared");};
}
function toggle(id){document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');}
function download(text,filename){const blob=new Blob([text],{type:'application/octet-stream'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();URL.revokeObjectURL(a.href);}
function updateTS(id,key){if(document.getElementById(id))document.getElementById(id).textContent=localStorage.getItem(key)||"Not saved";}
function renderWelcome(){return `<section class="card"><h1>Welcome</h1></section>`;}
function renderStrategy(){return `<section class="card"><h1>Strategy</h1></section>`;}
function renderDashboard(){return `
<section class="card"><h1>Dashboard</h1>
<div id="tile-resume" class="btn ok">Resume Builder</div>
<div id="tile-letter" class="btn ok">Cover Letters</div>
<div id="tile-intel" class="btn ok">Company Intel</div>
</section>
<section class="card section" id="section-resume">
<h2>Resume</h2><textarea id="resume-text" class="input" rows="6"></textarea>
<p>Last saved: <span id="resume-ts"></span></p>
<button id="save-resume" class="btn ok">Save Draft</button>
<button id="dl-resume" class="btn secondary">Download TXT</button>
<button id="pdf-resume" class="btn secondary">Download PDF</button>
</section>
<section class="card section" id="section-letter">
<h2>Letter</h2><textarea id="letter-text" class="input" rows="6"></textarea>
<p>Last saved: <span id="letter-ts"></span></p>
<button id="save-letter" class="btn ok">Save Draft</button>
<button id="dl-letter" class="btn secondary">Download TXT</button>
<button id="pdf-letter" class="btn secondary">Download PDF</button>
</section>
<section class="card section" id="section-intel">
<h2>Company Intel</h2>
<input class="input" placeholder="Company name"/><br/><input class="input" placeholder="Role"/><br/>
<textarea class="input" rows="4" placeholder="Notes"></textarea><br/>
<button id="open-intel" class="btn ok">Save Intel (stub)</button>
</section>
<section class="card"><button id="clear-all" class="btn warn">Clear All Drafts</button></section>`;}
window.addEventListener('hashchange',()=>navigate(location.hash));navigate(location.hash);
})();