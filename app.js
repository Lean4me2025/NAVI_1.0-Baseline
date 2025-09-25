
const screens = ["welcome","traits","results","reflection","choosepath","navi_welcome","navi_strategy","navi_dashboard","navi_plans"];
let state = { selectedTraits: [], reflectionChoice: null, ooh: [], oohSource: "assets/data/ooh.json", traitsList: [], userEmail: null, accessUnlocked: false };


function isProtected(id){
  // Protect Navi pages & Plans until signed in
  return ["navi_welcome","navi_strategy","navi_dashboard","navi_plans","choosepath"].includes(id);
}

function show(id){
  if(isProtected(id) && !state.userEmail){
    id = "signin";
  }

  screens.forEach(s=>document.getElementById(s).style.display = (s===id?"block":"none"));
  document.querySelectorAll('.step').forEach(el=>{ el.classList.toggle('active', el.dataset.step === id); });
  window.scrollTo({top:0, behavior:"instant"});
  refreshSnapshot();
}

async function loadTraits(){
  // If traits from previous packages exist, prefer those, else use a known list
  try {
    const res = await fetch('assets/data/traits.json');
    if (res.ok) { state.traitsList = await res.json(); }
  } catch(e) {}
  if (!state.traitsList || !state.traitsList.length){
    state.traitsList = [
      {name:"Analytical"},{name:"Creative"},{name:"Empathetic"},{name:"Detail-Oriented"},{name:"Strategic"},
      {name:"Leadership"},{name:"Adaptable"},{name:"Collaborative"},{name:"Independent"},{name:"Organized"},
      {name:"Problem-Solver"},{name:"Innovative"},{name:"Resilient"},{name:"Curious"},{name:"Results-Driven"},
      {name:"Patient"},{name:"Persuasive"},{name:"Observant"},{name:"Resourceful"},{name:"Proactive"},
      {name:"Calm Under Pressure"},{name:"Ethical"},{name:"Diligent"},{name:"Learner"},{name:"Mentor"},
      {name:"Visionary"},{name:"Practical"},{name:"Systematic"},{name:"Communicator"},{name:"Listener"},
      {name:"Decision-Maker"},{name:"Numerate"},{name:"Verbal Reasoning"},{name:"Spatial Reasoning"},{name:"Entrepreneurial"},
      {name:"Customer-Focused"},{name:"Process-Oriented"},{name:"Data-Driven"},{name:"Hands-On"},{name:"Technical"},
      {name:"Design-Thinking"},{name:"Storyteller"},{name:"Quantitative"},{name:"Qualitative"},{name:"Networker"},
      {name:"Teacher"},{name:"Planner"},{name:"Operator"},{name:"Researcher"},{name:"Finisher"}
    ].map((n,i)=>({id:`t${String(i+1).padStart(2,'0')}`, name:n.name}));
  }
  const grid = document.getElementById('traitsGrid'); grid.innerHTML = "";
  state.traitsList.forEach(t=>{
    const div = document.createElement('div'); div.className='trait'; div.textContent=t.name;
    div.addEventListener('click', ()=>toggleTrait(div,t.name)); grid.appendChild(div);
  });
}

async function loadOOH(){
  const res = await fetch(state.oohSource);
  const data = await res.json();
  state.ooh = data;
  const banner = document.getElementById('dataBanner');
  banner.innerHTML = `Data loaded: <strong>${state.ooh.length}</strong> occupations <span class="tag">${state.oohSource.replace('assets/data/','')}</span>`;
}

function toggleTrait(el, trait){
  const idx = state.selectedTraits.indexOf(trait);
  if(idx>=0){ state.selectedTraits.splice(idx,1); el.classList.remove('selected'); }
  else{ state.selectedTraits.push(trait); el.classList.add('selected'); }
  document.getElementById('clearBtn').disabled = state.selectedTraits.length===0;
  document.getElementById('seeResultsBtn').disabled = state.selectedTraits.length===0;
  document.getElementById('selCount').textContent = state.selectedTraits.length;
}

function clearSelections(){
  state.selectedTraits = [];
  document.querySelectorAll('.trait.selected').forEach(el=>el.classList.remove('selected'));
  document.getElementById('clearBtn').disabled = true;
  document.getElementById('seeResultsBtn').disabled = true;
  document.getElementById('selCount').textContent = 0;
}

function jaccard(a,b){
  const A = new Set(a), B = new Set(b);
  const inter = [...A].filter(x=>B.has(x)).length;
  const uni = new Set([...A, ...B]).size || 1;
  return inter/uni;
}

function scoreOccupation(occ){
  const align = jaccard(state.selectedTraits, occ.traits_map || []);
  const growth = (occ.growth_outlook_pct||0)/100;
  const pay = Math.min((occ.median_pay_usd||0)/200000, 1);
  return align*0.7 + growth*0.15 + pay*0.15;
}

function computeResults(){
  const list = document.getElementById('rolesList'); list.innerHTML = "";
  const scored = state.ooh.map(o=>({occ:o, score: scoreOccupation(o)})).sort((a,b)=>b.score-a.score).slice(0,12);
  scored.forEach(({occ, score})=>{
    const li = document.createElement('li'); li.className="role";
    const tags = (occ.traits_map||[]).slice(0,6).map(t=>`<span class="tag">${t}</span>`).join(' ');
    const pay = occ.median_pay_usd ? `$${occ.median_pay_usd.toLocaleString()}` : '—';
    const growth = (occ.growth_outlook_pct!=null) ? `${occ.growth_outlook_pct}%` : '—';
    li.innerHTML = `
      <strong>${occ.title}</strong>
      <div class="small">${(occ.traits_map||[]).slice(0,3).join(', ')}</div>
      <div class="small">SOC: ${occ.soc||'—'} • Pay (median): ${pay} • Growth: ${growth}</div>
      <div class="small">${occ.summary ? occ.summary : ''}</div>
      <div>${tags}</div>
      <div class="small"><a href="${occ.source_url||'#'}" target="_blank" rel="noopener">Source</a></div>
    `;
    list.appendChild(li);
  });
}

function selectReflection(val){
  state.reflectionChoice = val;
  document.querySelectorAll('[data-ref]').forEach(el=>el.classList.toggle('selected', el.dataset.ref===val));
  document.getElementById('toChoosePath').disabled = !val;
}

function refreshSnapshot(){
  const tt = (state.selectedTraits||[]).slice(0,5).join(', ') || '—';
  const rc = state.reflectionChoice || '—';
  const el1 = document.getElementById('topTraits'); if(el1) el1.textContent = tt;
  const el2 = document.getElementById('refChoice'); if(el2) el2.textContent = rc;
}

function exportSnapshot(){
  const payload = {
    traits: state.selectedTraits,
    reflection: state.reflectionChoice,
    topMatches: Array.from(document.querySelectorAll('#rolesList .role strong')).slice(0,5).map(n=>n.textContent),
    dataSource: state.oohSource,
    timestamp: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(payload,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = 'nova_navi_snapshot.json'; a.click(); URL.revokeObjectURL(url);
}


function saveSession(){
  try{
    localStorage.setItem("nova_navi_session", JSON.stringify({email: state.userEmail, access: state.accessUnlocked}));
  }catch(e){}
}
function loadSession(){
  try{
    const raw = localStorage.getItem("nova_navi_session");
    if(raw){
      const s = JSON.parse(raw);
      state.userEmail = s.email || null;
      state.accessUnlocked = !!s.access;
    }
  }catch(e){}
}
function updateHeader(){
  const sb = document.getElementById('signinBtn');
  const so = document.getElementById('signoutBtn');
  const ab = document.getElementById('accessBadge');
  if(state.userEmail){
    if(sb) sb.style.display = 'none';
    if(so) so.style.display = 'inline-block';
  }else{
    if(sb) sb.style.display = 'inline-block';
    if(so) so.style.display = 'none';
  }
  if(ab) ab.style.display = state.accessUnlocked ? 'inline-block' : 'none';
  if(state.accessUnlocked){ ab && ab.classList.add('success'); }
}

function handleSignIn(){
  const input = document.getElementById('signinEmail');
  const val = (input?.value||'').trim();
  if(!val || !val.includes('@')){ alert('Please enter a valid email.'); return; }
  state.userEmail = val;
  saveSession(); updateHeader(); show('welcome');
}

function handleAccessCode(){
  const el = document.getElementById('accessInput');
  const msg = document.getElementById('accessMsg');
  const code = (el?.value||'').trim().toUpperCase();
  const valid = ["NAVI-ACCESS-2025","NOVA-NAVI-KEY","MASTER-UNLOCK"];
  if(valid.includes(code)){
    state.accessUnlocked = true; saveSession(); updateHeader();
    if(msg){ msg.textContent = "Unlocked! You now have access to extras."; msg.style.color = "#8ff0b3"; }
  }else{
    if(msg){ msg.textContent = "Invalid code. Try again or contact support."; msg.style.color = "#ffb3b3"; }
  }
}

function signOut(){
  state.userEmail = null;
  state.accessUnlocked = false;
  saveSession(); updateHeader(); show('welcome');
}

function init(){
  loadTraits(); loadOOH(); show('welcome');
  document.getElementById('clearBtn').disabled = true;
  document.getElementById('seeResultsBtn').disabled = true;
  document.getElementById('toChoosePath').disabled = true;
}
window.addEventListener('DOMContentLoaded', ()=>{
  loadSession(); updateHeader();
  const sb = document.getElementById('signinBtn'); const so = document.getElementById('signoutBtn');
  if(sb){ sb.addEventListener('click', ()=>show('signin')); }
  if(so){ so.addEventListener('click', signOut); }
  init();
});
