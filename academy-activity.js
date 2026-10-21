(()=>{
'use strict';
const q=id=>document.getElementById(id);
const labels={pt:{days:['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],title:'ATIVIDADE SEMANAL',heading:'Sua semana de estudos',streak:n=>n===1?'1 dia seguido':n+' dias seguidos',active:n=>n===1?'1 dia ativo esta semana':n+' dias ativos esta semana',progress:'Progresso do curso: ',copy:n=>n?'Você estudou em '+n+' '+(n===1?'dia':'dias')+' nesta semana.':'Sua atividade de estudo aparecerá aqui conforme você acessar a Academy.',done:'estudou',inactive:'sem atividade',today:'hoje'},en:{days:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],title:'WEEKLY ACTIVITY',heading:'Your study week',streak:n=>n===1?'1 day streak':n+' day streak',active:n=>n===1?'1 active day this week':n+' active days this week',progress:'Course progress: ',copy:n=>n?'You studied on '+n+' '+(n===1?'day':'days')+' this week.':'Your study activity will appear here as you use the Academy.',done:'studied',inactive:'no activity',today:'today'},es:{days:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'],title:'ACTIVIDAD SEMANAL',heading:'Tu semana de estudio',streak:n=>n===1?'1 día seguido':n+' días seguidos',active:n=>n===1?'1 día activo esta semana':n+' días activos esta semana',progress:'Progreso del curso: ',copy:n=>n?'Estudiaste '+n+' '+(n===1?'día':'días')+' esta semana.':'Tu actividad aparecerá aquí cuando estudies en la Academia.',done:'estudió',inactive:'sin actividad',today:'hoy'}};
let latestRows=[];
const locale=()=>labels[document.documentElement.lang]||labels.pt;

function localDateString(d=new Date()){
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function startOfWeek(d=new Date()){
  const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  const js=x.getDay();
  x.setDate(x.getDate()-(js===0?6:js-1));
  return x;
}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}

function ensureCard(){
  if(q('abbaWeeklyActivity'))return q('abbaWeeklyActivity');
  const dashboard=q('learningDashboard');
  if(!dashboard)return null;
  const card=document.createElement('section');
  card.id='abbaWeeklyActivity';
  card.className='card abba-weekly-card';
  card.innerHTML=`
    <div class="abba-weekly-head">
      <div><div class="eyebrow">ATIVIDADE SEMANAL</div><h2>Sua semana de estudos</h2></div>
      <div class="abba-streak" id="abbaStreak">0 dias</div>
    </div>
    <p class="abba-weekly-copy" id="abbaWeeklyCopy">Acompanhe os dias em que você estudou na ABBA Academy.</p>
    <div class="abba-week-days" id="abbaWeekDays" aria-label="Atividade desta semana"></div>
    <div class="abba-weekly-foot"><strong id="abbaActiveCount">0 dias ativos</strong><span id="abbaCourseProgress"></span></div>`;
  dashboard.insertBefore(card,dashboard.firstChild);
  return card;
}

async function getSessionUser(){
  try{return (await db.auth.getSession()).data.session?.user||null}catch{return null}
}

async function recordToday(user){
  const today=localDateString();
  const now=new Date().toISOString();
  const {error}=await db.from('abba_daily_activity').upsert({user_id:user.id,activity_date:today,last_seen_at:now,updated_at:now},{onConflict:'user_id,activity_date'});
  if(error)console.error('ABBA activity record',error);
}

function calculateStreak(rows){
  const dates=new Set((rows||[]).map(r=>String(r.activity_date)));
  let cursor=new Date();
  let streak=0;
  while(dates.has(localDateString(cursor))){streak++;cursor=addDays(cursor,-1)}
  return streak;
}

function render(rows){
  const card=ensureCard();if(!card)return;
  latestRows=rows||[];const tr=locale();
  const heading=card.querySelector('.abba-weekly-head .eyebrow');if(heading)heading.textContent=tr.title;
  const title=card.querySelector('.abba-weekly-head h2');if(title)title.textContent=tr.heading;
  const active=new Set((rows||[]).map(r=>String(r.activity_date)));
  const today=localDateString();
  const monday=startOfWeek();
  const host=q('abbaWeekDays');host.innerHTML='';
  let weekCount=0;
  for(let i=0;i<7;i++){
    const d=addDays(monday,i),key=localDateString(d),didStudy=active.has(key),isToday=key===today;
    if(didStudy)weekCount++;
    const cell=document.createElement('div');
    cell.className='abba-day'+(didStudy?' active':'')+(isToday?' today':'');
    cell.setAttribute('aria-label',`${tr.days[i]}: ${didStudy?tr.done:tr.inactive}${isToday?', '+tr.today:''}`);
    cell.innerHTML=`<span class="abba-day-mark">${didStudy?'✓':tr.days[i].slice(0,2)}</span><small>${tr.days[i]}</small>`;
    host.appendChild(cell);
  }
  const streak=calculateStreak(rows);
  q('abbaStreak').textContent=tr.streak(streak);
  q('abbaActiveCount').textContent=tr.active(weekCount);
  const progress=q('progressLabel')?.textContent?.trim();
  q('abbaCourseProgress').textContent=progress?tr.progress+progress:'';
  q('abbaWeeklyCopy').textContent=tr.copy(weekCount);
}

async function refresh(){
  const user=await getSessionUser();if(!user)return;
  await recordToday(user);
  const since=addDays(new Date(),-60);
  const {data,error}=await db.from('abba_daily_activity').select('activity_date,last_seen_at').eq('user_id',user.id).gte('activity_date',localDateString(since)).order('activity_date',{ascending:false});
  if(error){console.error('ABBA weekly activity',error);return}
  render(data||[]);
}

function wireStudySignals(){
  ['continueBtn','completeBtn','saveNoteBtn','nextBtn'].forEach(id=>q(id)?.addEventListener('click',()=>refresh(),{passive:true}));
  q('muxPlayer')?.addEventListener('play',()=>refresh(),{passive:true});
}

setTimeout(()=>{ensureCard();wireStudySignals();refresh()},900);
setTimeout(refresh,2200);
new MutationObserver(()=>{if(q('abbaWeeklyActivity'))render(latestRows)}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
})();

if(!document.querySelector('script[data-abba-resources]')){
  const s=document.createElement('script');
  s.src='academy-resources.js?v=20260910j';
  s.dataset.abbaResources='1';
  document.body.appendChild(s);
}

if(!document.querySelector('script[data-abba-ai-coach]')){
  const s=document.createElement('script');
  s.src='academy-coach.js?v=20260916a';
  s.dataset.abbaAiCoach='1';
  document.body.appendChild(s);
}
