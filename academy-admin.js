const SUPABASE_URL='https://yecywtxbuhfukergbwfc.supabase.co';
const SUPABASE_KEY='sb_publishable_jFIuvZYIs1b-6IjqCnDPDw_BDivhFKs';
const db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let session=null,courses=[],activeCourse=null,lessons=[],current=null,transcriptJobs=new Set();
const $=id=>document.getElementById(id); const show=(id,yes=true)=>$(id).classList.toggle('hidden',!yes);
async function api(payload){const {data:{session:s}}=await db.auth.getSession(); if(!s)throw new Error('Please sign in again.'); const r=await fetch(`${SUPABASE_URL}/functions/v1/abba-mux-admin`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${s.access_token}`,'apikey':SUPABASE_KEY},body:JSON.stringify(payload)}); const j=await r.json(); if(!r.ok)throw new Error(j.error||'Request failed'); return j;}
function fmtLocal(v){if(!v)return'';const d=new Date(v);const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`}
function render(){
 const host=$('lessons');host.replaceChildren();
 $('lessonCount').textContent=lessons.length+' aulas';
 lessons.forEach(l=>{const b=document.createElement('button');b.type='button';b.className='lessonItem'+(current?.id===l.id?' active':'');
 const title=document.createElement('strong');title.textContent=l.lesson_number+'. '+l.title;
 const state=document.createElement('span');state.className='small';state.textContent=(l.is_published?'Publicada':'Oculta')+' · '+(l.mux_playback_id?'Video disponible':'Sin video')+(l.transcript?' · Transcripción disponible':'');
 b.append(title,document.createElement('br'),state);b.onclick=()=>openLesson(l.id);host.appendChild(b)})
}
function openLesson(id){
 current=lessons.find(x=>x.id===id);if(!current)return;render();show('empty',false);show('editor',true);
 $('heading').textContent='Aula '+current.lesson_number;$('title').value=current.title||'';$('description').value=current.description||'';$('releaseAt').value=fmtLocal(current.release_at);
 $('lessonSummary').value=current.summary||'';$('lessonTranscript').value=current.transcript||'';$('lessonKeyPoints').value=(current.key_points||[]).join('\n');
 $('lessonVisibility').textContent=current.is_published?'Publicada':'Oculta';$('publishLesson').disabled=current.is_published;$('hideLesson').disabled=!current.is_published;
 $('lessonEditStatus').textContent='';$('videoState').textContent=current.mux_playback_id?'Video disponible · '+(current.duration_minutes||'')+' min':'Sin video.';
 if(current.mux_playback_id&&!current.transcript)ensureTranscript(current.id);
}
async function ensureTranscript(lessonId){if(transcriptJobs.has(lessonId))return;transcriptJobs.add(lessonId);try{for(let i=0;i<90;i++){const s=await api({action:'transcription-status',lesson_id:lessonId});const item=lessons.find(l=>l.id===lessonId);if(s.status==='ready'){if(item){item.transcript=s.transcript||item.transcript;if(s.updated_at)item.updated_at=s.updated_at;}if(current?.id===lessonId)$('videoState').textContent=`Video ready · ${current.duration_minutes||''} min · Transcript ready`;render();return}if(current?.id===lessonId)$('videoState').textContent=`Video ready · ${current.duration_minutes||''} min · Creating transcript...`;await new Promise(r=>setTimeout(r,5000));}}catch(e){if(current?.id===lessonId)$('videoState').textContent=`Video ready · ${current.duration_minutes||''} min · Transcript retry needed`;}finally{transcriptJobs.delete(lessonId)}}
async function load(){
 const grid=document.querySelector('#adminView .grid');
 const courseStatus=$('courseLoadStatus');
 try{
  if(courseStatus){courseStatus.textContent='Cargando cursos y contenidos…';show('courseLoadNotice',true)}
  const courseResult=await api({action:'list-courses'});courses=courseResult.courses||[];const selectedId=$('courseSelect').value||activeCourse?.id;activeCourse=courses.find(c=>c.id===selectedId)||courses[0]||null;const select=$('courseSelect');select.replaceChildren();courses.forEach(c=>{const option=document.createElement('option');option.value=c.id;option.textContent=c.title;select.append(option)});if(activeCourse){select.value=activeCourse.id;$('courseTitleInput').value=activeCourse.title;$('courseDescriptionInput').value=activeCourse.description||'';$('courseVisibility').textContent=activeCourse.is_published?'Curso publicado':'Curso cerrado para estudiantes';}const j=activeCourse?await api({action:'list-lessons',course_id:activeCourse.id}):{lessons:[]};lessons=j.lessons||[];current=null;show('editor',false);show('empty',true);
  show('loginCard',false);show('adminView',true);show('logout',true);
  if(grid)grid.style.display='';
  show('courseLoadNotice',false);render();
  if(lessons.length)openLesson(lessons[0].id);
 }catch(e){
  const {data:{user}}=await db.auth.getUser();
  if(user?.app_metadata?.abba_admin===true){
   show('loginCard',false);show('adminView',true);show('logout',true);
   if(grid)grid.style.display='none';
   show('courseLoadNotice',true);
   if(courseStatus)courseStatus.textContent='No se pudo cargar el editor de clases. '+(e.message||'Intenta nuevamente.')+' Las secciones de estudiantes y becas siguen disponibles.';
  }else{$('loginStatus').textContent='Administrator access required.';}
 }
}
$('retryCourses').onclick=()=>load();
$('loginForm').onsubmit=async e=>{e.preventDefault();$('loginStatus').textContent='Signing in...';const {data,error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){$('loginStatus').textContent=error.message;return}session=data.session;$('loginStatus').textContent='';await load()};
$('logout').onclick=async()=>{await db.auth.signOut();location.reload()};
$('courseSelect').onchange=()=>load();
$('saveCourse').onclick=async()=>{if(!activeCourse)return;const button=$('saveCourse');button.disabled=true;try{const out=await api({action:'update-course',course_id:activeCourse.id,title:$('courseTitleInput').value,description:$('courseDescriptionInput').value});Object.assign(activeCourse,out.course);$('courseSelect').selectedOptions[0].textContent=activeCourse.title;$('courseEditStatus').textContent='Curso guardado.'}catch(e){$('courseEditStatus').textContent=e.message}finally{button.disabled=false}};
async function changeLesson(patch,button){if(!current)return;const target=current;button.disabled=true;try{const out=await api({action:'update-lesson',lesson_id:target.id,expected_updated_at:target.updated_at,...patch});Object.assign(target,out.lesson);render();if(current?.id===target.id){$('lessonVisibility').textContent=target.is_published?'Publicada':'Oculta';$('publishLesson').disabled=target.is_published;$('hideLesson').disabled=!target.is_published;$('lessonEditStatus').textContent='Cambios guardados.'}}catch(e){$('lessonEditStatus').textContent=e.message}finally{button.disabled=false;if(current?.id===target.id){$('publishLesson').disabled=target.is_published;$('hideLesson').disabled=!target.is_published}}}
$('saveMeta').onclick=()=>changeLesson({title:$('title').value,description:$('description').value,release_at:$('releaseAt').value?new Date($('releaseAt').value).toISOString():null,summary:$('lessonSummary').value,transcript:$('lessonTranscript').value,key_points:$('lessonKeyPoints').value.split('\n').map(s=>s.trim()).filter(Boolean)},$('saveMeta'));
$('publishLesson').onclick=()=>{if(current&&confirm('¿Publicar esta aula? Solo estará disponible para estudiantes cuando el curso esté abierto y se cumpla la fecha de liberación.'))changeLesson({is_published:true},$('publishLesson'))};
$('hideLesson').onclick=()=>{if(current&&confirm('¿Ocultar esta aula a los estudiantes? Su contenido se conservará.'))changeLesson({is_published:false},$('hideLesson'))};
$('uploadBtn').onclick=async()=>{if(!current)return;const file=$('videoFile').files[0];if(!file){alert('Choose a video file first.');return}try{$('uploadBtn').disabled=true;show('progressWrap',true);$('uploadStatus').textContent='Preparing secure upload...';$('progressBar').style.width='2%';const j=await api({action:'create-upload',lesson_id:current.id});await uploadFile(j.upload_url,file);$('uploadStatus').textContent='Upload complete. Video is processing...';$('progressBar').style.width='100%';await waitForAsset(j.upload_id,current.id)}catch(e){$('uploadStatus').textContent=e.message;$('uploadBtn').disabled=false}};
function uploadFile(url,file){return new Promise((resolve,reject)=>{const x=new XMLHttpRequest();x.open('PUT',url);x.upload.onprogress=e=>{if(e.lengthComputable){const p=Math.max(3,Math.round(e.loaded/e.total*90));$('progressBar').style.width=p+'%';$('uploadStatus').textContent=`Uploading ${p}%`;}};x.onload=()=>x.status>=200&&x.status<300?resolve():reject(new Error('Video upload failed.'));x.onerror=()=>reject(new Error('Network error during upload.'));x.send(file);});}
async function waitForAsset(uploadId,lessonId){for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,5000));try{const s=await api({action:'upload-status',upload_id:uploadId,lesson_id:lessonId});if(s.ready){$('uploadStatus').textContent='Video ready ✓ · Creating transcript...';const item=lessons.find(l=>l.id===lessonId);item.mux_asset_id=s.asset_id;item.mux_playback_id=s.playback_id;item.duration_minutes=s.duration_minutes;if(s.updated_at)item.updated_at=s.updated_at;current=item;openLesson(lessonId);$('uploadBtn').disabled=false;ensureTranscript(lessonId);return}}catch(e){$('uploadStatus').textContent=e.message;$('uploadBtn').disabled=false;return}$('uploadStatus').textContent='Video is processing...';}$('uploadStatus').textContent='Upload succeeded. Processing is taking longer than expected; refresh later.';$('uploadBtn').disabled=false;}
(async()=>{const {data:{session:s}}=await db.auth.getSession();if(s){session=s;await load()}})();