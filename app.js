
const screens = ["welcome","traits","results","reflection","choosepath","navi_welcome"];
let state = { traits: [], selectedTraits: [], ooh: [], categories: [], filterCat: null };

function show(id){
  screens.forEach(s=>document.getElementById(s).style.display = (s===id?"block":"none"));
  window.scrollTo({top:0, behavior:"instant"});
  if(id==="traits"){ renderTraits(); }
  if(id==="results"){ renderChips(); computeResults(); }
}

// Load data (traits with categories, category matrix, ooh)
async function loadData(){
  const [traitsRes, catsRes, oohRes] = await Promise.all([
    fetch('assets/data/traits_with_categories.json'),
    fetch('assets/data/category_matrix.json'),
    fetch('assets/data/ooh.json')
  ]);
  state.traits = await traitsRes.json();
  state.categories = await catsRes.json();
  state.ooh = await oohRes.json();
  document.getElementById('dataBanner').innerHTML = 
    `Traits: <strong>${state.traits.length}</strong> • Categories: <strong>${state.categories.length}</strong> • Occupations: <strong>${state.ooh.length}</strong>`;
}

function renderTraits(){
  const grid = document.getElementById('traitsGrid'); grid.innerHTML = "";
  state.traits.forEach(t=>{
    const div = document.createElement('div'); div.className='trait'; div.textContent = `${t.name}`;
    div.title = t.category ? `Category: ${t.category}` : '';
    div.addEventListener('click', ()=>toggleTrait(div,t.name));
    grid.appendChild(div);
  });
  updateTraitButtons();
}

function toggleTrait(el, name){
  const i = state.selectedTraits.indexOf(name);
  if(i>=0){ state.selectedTraits.splice(i,1); el.classList.remove('selected'); }
  else{ state.selectedTraits.push(name); el.classList.add('selected'); }
  updateTraitButtons();
}

function updateTraitButtons(){
  document.getElementById('selCount').textContent = state.selectedTraits.length;
  document.getElementById('clearBtn').disabled = state.selectedTraits.length===0;
  document.getElementById('seeResultsBtn').disabled = state.selectedTraits.length===0;
}

function clearSelections(){
  state.selectedTraits = [];
  document.querySelectorAll('.trait.selected').forEach(el=>el.classList.remove('selected'));
  updateTraitButtons();
}

function jaccard(a,b){
  const A = new Set(a), B = new Set(b||[]);
  const inter = [...A].filter(x=>B.has(x)).length;
  const uni = new Set([...A, ...B]).size || 1;
  return inter/uni;
}

// Category inference for occupation via example keywords (simple heuristic, for demo)
function inferCategory(title){
  const t = (title||'').toLowerCase();
  if(/nurse|therap|counsel|social|health|medical/.test(t)) return "Health & Social Care";
  if(/teacher|professor|librar|trainer|coach|tutor|community/.test(t)) return "Education & Community";
  if(/sales|marketing|customer|retail|hospitality|manager|human resources|hr /.test(t)) return "Business, Sales & Service";
  if(/engineer|developer|software|architect|technician|cyber|data|it /.test(t)) return "Technology, Engineering & Technical";
  if(/electrician|plumber|carpenter|mechanic|machinist|welder|operator|production/.test(t)) return "Skilled Trades & Operations";
  if(/designer|artist|writer|editor|musician|illustrator|photograph/.test(t)) return "Creative, Media & Design";
  if(/police|fire|lifeguard|postal|bus driver|driver|delivery|transport|security/.test(t)) return "Public Safety, Transportation & Society";
  return null;
}

function renderChips(){
  const wrap = document.getElementById('categoryChips'); wrap.innerHTML = "";
  const allBtn = document.createElement('button'); allBtn.className='btn'; allBtn.textContent='All'; allBtn.onclick=()=>{ state.filterCat=null; computeResults(); };
  wrap.appendChild(allBtn);
  state.categories.forEach(c=>{
    const b=document.createElement('button'); b.className='category-chip'; b.textContent=c.category;
    b.onclick=()=>{ state.filterCat = c.category; computeResults(); };
    wrap.appendChild(b);
  });
}

function scoreOccupation(occ){
  const align = jaccard(state.selectedTraits, occ.traits_map);
  const growth = (occ.growth_outlook_pct||0)/100;
  const pay = Math.min((occ.median_pay_usd||0)/200000, 1);
  return align*0.7 + growth*0.15 + pay*0.15;
}

function computeResults(){
  const list = document.getElementById('rolesList'); list.innerHTML = "";
  let rows = state.ooh.slice();
  if(state.filterCat){
    rows = rows.filter(r=>{
      const cat = r.category || inferCategory(r.title);
      return cat === state.filterCat;
    });
  }
  const scored = rows.map(o=>({occ:o, score: scoreOccupation(o)})).sort((a,b)=>b.score-a.score).slice(0,20);
  scored.forEach(({occ})=>{
    const li = document.createElement('li'); li.className="role";
    const cat = occ.category || inferCategory(occ.title) || '—';
    const tags = (occ.traits_map||[]).slice(0,5).map(t=>`<span class="tag">${t}</span>`).join(' ');
    const pay = occ.median_pay_usd ? `$${occ.median_pay_usd.toLocaleString()}` : '—';
    const growth = (occ.growth_outlook_pct!=null) ? `${occ.growth_outlook_pct}%` : '—';
    li.innerHTML = `
      <div class="flex"><strong>${occ.title}</strong><span class="category-chip">${cat}</span></div>
      <div class="small">SOC: ${occ.soc||'—'} • Pay (median): ${pay} • Growth: ${growth}</div>
      <div class="small">${occ.summary||''}</div>
      <div style="margin-top:6px">${tags}</div>
    `;
    list.appendChild(li);
  });
}

window.addEventListener('DOMContentLoaded', async ()=>{
  await loadData();
  show('welcome');
});
