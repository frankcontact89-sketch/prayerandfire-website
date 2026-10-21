(()=>{
'use strict';
const q=id=>document.getElementById(id);
let lessonMap=new Map();
let totalLessons=40;
let loading=false;
const dict={pt:{lesson:'Aula',available:'Disponível',locked:'Bloqueada',notes:'Notas da Aula',notesCount:n=>n===1?'aula com notas':'aulas com notas',empty:'Você ainda não salvou notas.',done:(n,t)=>`${n} de ${t} aulas`,status:n=>n===1?'1 aula disponível':`${n} aulas disponíveis`,loading:'Carregando…',fail:'Não foi possível carregar suas notas agora.',journey:'do curso concluído'},en:{lesson:'Lesson',available:'Available',locked:'Locked',notes:'Lesson notes',notesCount:n=>n===1?'lesson with notes':'lessons with notes',empty:'You have not saved any notes yet.',done:(n,t)=>`${n} of ${t} lessons`,status:n=>n===1?'1 lesson available':`${n} lessons available`,loading:'Loading…',fail:'Unable to load your notes right now.',journey:'of course completed'},es:{lesson:'Clase',available:'Disponible',locked:'Bloqueada',notes:'Notas de la clase',notesCount:n=>n===1?'clase con notas':'clases con notas',empty:'Todavía no has guardado notas.',done:(n,t)=>`${n} de ${t} clases`,status:n=>n===1?'1 clase disponible':`${n} clases disponibles`,loading:'Cargando…',fail:'No se pudieron cargar tus notas.',journey:'del curso completado'}};
dict.te={lesson:'పాఠం',available:'అందుబాటులో ఉంది',locked:'లాక్ చేయబడింది',notes:'పాఠం గమనికలు',notesCount:n=>n+' పాఠాల గమనికలు',empty:'మీరు ఇంకా గమనికలు సేవ్ చేయలేదు.',done:(n,t)=>t+' పాఠాలలో '+n+' పూర్తయ్యాయి',status:n=>n+' పాఠాలు అందుబాటులో ఉన్నాయి',loading:'లోడ్ అవుతోంది…',fail:'గమనికలను లోడ్ చేయడం సాధ్యం కాలేదు.',journey:'కోర్సు పూర్తయింది'};
dict.hi={lesson:'पाठ',available:'उपलब्ध',locked:'लॉक है',notes:'पाठ के नोट्स',notesCount:n=>n+' पाठों के नोट्स',empty:'आपने अभी तक नोट्स सहेजे नहीं हैं।',done:(n,t)=>t+' में से '+n+' पाठ',status:n=>n+' पाठ उपलब्ध',loading:'लोड हो रहा है…',fail:'नोट्स लोड नहीं हो सके।',journey:'पाठ्यक्रम पूरा हुआ'};
dict.ne={lesson:'पाठ',available:'उपलब्ध',locked:'बन्द',notes:'पाठका नोटहरू',notesCount:n=>n+' पाठका नोटहरू',empty:'तपाईंले अझै नोटहरू सुरक्षित गर्नुभएको छैन।',done:(n,t)=>t+' मध्ये '+n+' पाठ',status:n=>n+' पाठ उपलब्ध',loading:'लोड हुँदैछ…',fail:'नोटहरू लोड गर्न सकिएन।',journey:'पाठ्यक्रम पूरा भयो'};
dict['de-CH']={lesson:'Lektion',available:'Verfügbar',locked:'Gesperrt',notes:'Notizen zur Lektion',notesCount:n=>n+' Lektionen mit Notizen',empty:'Du hast noch keine Notizen gespeichert.',done:(n,t)=>n+' von '+t+' Lektionen',status:n=>n+' Lektionen verfügbar',loading:'Wird geladen…',fail:'Notizen konnten nicht geladen werden.',journey:'des Kurses abgeschlossen'};
const tr=()=>dict[document.documentElement.lang]||dict.en;
let lastData=null;

async function session(){
  try{return (await db.auth.getSession()).data.session||null}catch{return null}
}

function setText(id,value){const el=q(id);if(el)el.textContent=value}

function formatTime(seconds){
  const s=Math.max(0,Math.floor(Number(seconds)||0));
  const h=Math.floor(s/3600),m=Math.floor((s%3600)/60);
  return h?`${h}h ${m}min`:`${m} min`;
}

function renderLessons(rows){
  const host=q('settingsLessonList');if(!host)return;
  host.innerHTML='';lessonMap=new Map();
  (rows||[]).forEach(l=>lessonMap.set(Number(l.lesson_number),l));
  for(let n=1;n<=totalLessons;n++){
    const lesson=lessonMap.get(n);
    const available=!!(lesson?.is_published&&lesson?.mux_playback_id);
    const row=document.createElement(available?'button':'div');
    row.className='settings-lesson-row '+(available?'available':'locked');
    if(available)row.type='button';
    const num=document.createElement('span');num.className='lesson-index';num.textContent=String(n).padStart(2,'0');
    const info=document.createElement('span');info.className='lesson-simple';
    const strong=document.createElement('strong');strong.textContent=`${tr().lesson} ${n}`;
    const small=document.createElement('small');small.textContent=available?tr().available:tr().locked;
    info.append(strong,small);
    const state=document.createElement('span');state.className='lesson-state';state.setAttribute('aria-hidden','true');state.textContent=available?'›':'🔒';
    row.append(num,info,state);
    if(available)row.addEventListener('click',()=>{
      q('settingsPanel')?.classList.add('hidden');
      try{if(typeof openLessonById==='function')openLessonById(lesson.id,true)}catch{}
    });
    host.appendChild(row);
  }
}

function renderNotes(notes,lessonRows){
  const host=q('settingsNotesList');if(!host)return;
  host.innerHTML='';
  const byId=new Map((lessonRows||[]).map(l=>[l.id,Number(l.lesson_number)]));
  const clean=(notes||[]).filter(n=>String(n.note_text||'').trim()).map(n=>({...n,lesson_number:byId.get(n.lesson_id)})).filter(n=>Number.isFinite(n.lesson_number));
  clean.sort((a,b)=>a.lesson_number-b.lesson_number);
  setText('settingsNotesCount',`${clean.length} ${tr().notesCount(clean.length)}`);
  if(!clean.length){
    const empty=document.createElement('div');empty.className='empty-notes';empty.textContent='Você ainda não salvou notas.';host.appendChild(empty);return;
  }
  clean.forEach(note=>{
    const card=document.createElement('button');card.type='button';card.className='saved-note-card';
    const head=document.createElement('div');head.className='saved-note-head';
    const title=document.createElement('strong');title.textContent=`${tr().notes} ${note.lesson_number}`;
    const badge=document.createElement('span');badge.textContent=`${tr().lesson} ${note.lesson_number}`;
    head.append(title,badge);
    const p=document.createElement('p');p.textContent=String(note.note_text||'').trim();
    card.append(head,p);
    const lesson=(lessonRows||[]).find(l=>l.id===note.lesson_id&&l.is_published&&l.mux_playback_id);
    if(lesson)card.addEventListener('click',()=>{
      q('settingsPanel')?.classList.add('hidden');
      try{if(typeof openLessonById==='function')openLessonById(lesson.id,true)}catch{}
      setTimeout(()=>document.querySelector('[data-tab="notes"]')?.click(),400);
    });
    else card.disabled=true;
    host.appendChild(card);
  });
}

function renderProgress(rows){
  const completed=(rows||[]).filter(r=>r.completed).length;
  const watched=(rows||[]).reduce((sum,r)=>sum+Math.max(0,Number(r.watched_seconds)||0),0);
  const pct=totalLessons?Math.round(completed/totalLessons*100):0;
  setText('journeyPercent',`${pct}%`);setText('journeyDone',tr().done(completed,totalLessons));setText('journeyTime',formatTime(watched));
  const bar=q('journeyBar');if(bar)bar.style.width=`${pct}%`;
}

async function refresh(){
  if(loading)return;loading=true;
  const s=await session();if(!s){loading=false;return;}
  setText('settingsLessonStatus','Carregando…');
  try{
    const {data:course,error:courseErr}=await db.from('abba_courses').select('id,total_lessons').eq('slug','annual-program').maybeSingle();
    if(courseErr)throw courseErr;
    totalLessons=Math.min(40,Math.max(1,Number(course?.total_lessons)||40));
    const courseId=course?.id;
    if(!courseId)throw new Error('Course not found');
    const [lessonRes,progressRes,noteRes]=await Promise.all([
      db.from('abba_lessons').select('id,lesson_number,is_published,mux_playback_id').eq('course_id',courseId).order('lesson_number'),
      db.from('abba_lesson_progress').select('lesson_id,completed,watched_seconds').eq('user_id',s.user.id),
      db.from('abba_lesson_notes').select('lesson_id,note_text,updated_at').eq('user_id',s.user.id)
    ]);
    if(lessonRes.error)throw lessonRes.error;
    const lessonRows=lessonRes.data||[];
    renderLessons(lessonRows);
    renderProgress(progressRes.error?[]:(progressRes.data||[]));
    renderNotes(noteRes.error?[]:(noteRes.data||[]),lessonRows);
    lastData={lessons:lessonRows,progress:progressRes.error?[]:(progressRes.data||[]),notes:noteRes.error?[]:(noteRes.data||[])};
    const available=lessonRows.filter(l=>l.is_published&&l.mux_playback_id).length;
    setText('settingsLessonStatus',tr().status(available));
  }catch(err){
    console.error('ABBA settings',err);
    setText('settingsLessonStatus','');
    const host=q('settingsLessonList');if(host&&!host.children.length)renderLessons([]);
    const notes=q('settingsNotesList');if(notes&&!notes.children.length){const e=document.createElement('div');e.className='empty-notes';e.textContent='Não foi possível carregar suas notas agora.';notes.appendChild(e);}
  }finally{loading=false;}
}

new MutationObserver(()=>{if(!lastData)return;renderLessons(lastData.lessons);renderProgress(lastData.progress);renderNotes(lastData.notes,lastData.lessons);const count=lastData.lessons.filter(l=>l.is_published&&l.mux_playback_id).length;setText('settingsLessonStatus',tr().status(count));const suffix=q('journeyPercent')?.closest('.journey-card')?.querySelector('small');if(suffix)suffix.textContent=tr().journey;}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
q('settingsBtn')?.addEventListener('click',()=>setTimeout(refresh,30));
q('saveNoteBtn')?.addEventListener('click',()=>setTimeout(refresh,500));
setTimeout(()=>{if(!q('portalView')?.classList.contains('hidden'))refresh()},1200);
})();