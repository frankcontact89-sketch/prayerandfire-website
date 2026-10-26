import { createClient } from 'npm:@supabase/supabase-js@2.58.0';
const allowedOrigins=new Set(['https://prayerandfire.org','https://www.prayerandfire.org','https://alineramiro.com','https://www.alineramiro.com']);
const corsFor=(origin:string)=>({'Access-Control-Allow-Origin':allowedOrigins.has(origin)?origin:'https://prayerandfire.org','Vary':'Origin','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'});
const clean=(s:string)=>s.replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();
const RESOURCE_BUCKET='abba-course-files';
function tsToSeconds(ts:string){const p=ts.replace(',','.').split(':').map(Number);if(p.length===3)return Math.round(p[0]*3600+p[1]*60+p[2]);return Math.round((p[0]||0)*60+(p[1]||0));}
function parseVtt(vtt:string){const lines=vtt.replace(/\r/g,'').split('\n');const cues:any[]=[];for(let i=0;i<lines.length;i++){const line=lines[i].trim();if(!line.includes('-->'))continue;const [a,b]=line.split('-->').map(x=>x.trim().split(' ')[0]);const text:string[]=[];for(let j=i+1;j<lines.length&&lines[j].trim();j++)text.push(lines[j].trim());const t=clean(text.join(' '));if(t)cues.push({start:tsToSeconds(a),end:tsToSeconds(b),text:t});}return cues;}
function makeSummary(transcript:string){const text=clean(transcript).replace(/\s+/g,' ');if(!text)return {summary:'',key_points:[]};const sentences=text.split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(s=>s.length>25);const pool=sentences.length?sentences:[text];const chosen=pool.slice(0,Math.min(5,pool.length));const summary=chosen.slice(0,3).join(' ');const key_points=chosen.slice(0,5).map(s=>s.length>180?s.slice(0,177)+'…':s);return {summary,key_points};}
function attachmentsOf(v:any){return Array.isArray(v)?v:[];}
Deno.serve(async(req)=>{const origin=req.headers.get('Origin')||'';const cors=corsFor(origin);const json=(body:any,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});if(origin&&!allowedOrigins.has(origin))return json({error:'Origin not allowed'},403);if(req.method==='OPTIONS')return new Response('ok',{headers:cors});if(req.method!=='POST')return json({error:'Method not allowed'},405);try{
 const auth=req.headers.get('Authorization')||''; const url=Deno.env.get('SUPABASE_URL')!; const anon=Deno.env.get('SUPABASE_ANON_KEY')!; const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
 const uc=createClient(url,anon,{global:{headers:{Authorization:auth}}}); const {data:{user},error:ue}=await uc.auth.getUser(); if(ue||!user?.email)return json({error:'Unauthorized'},401);
 const admin=createClient(url,service); const email=user.email.toLowerCase(); const {data:ar}=await admin.from('abba_admins').select('email').eq('email',email).maybeSingle(); if(!ar&&user.app_metadata?.abba_admin!==true)return json({error:'Admin access required'},403);
 const body=await req.json();
 if(body.action==='list-courses'){const {data,error}=await admin.from('abba_courses').select('id,title,description,total_lessons,is_published,updated_at').order('created_at');if(error)throw error;return json({courses:data||[]});}
 if(body.action==='update-course'){
  const id=String(body.course_id||'');if(!id)return json({error:'Course required'},400);
  if(typeof body.title!=='string'||!body.title.trim()||body.title.length>250||typeof body.description!=='string'||body.description.length>10000)return json({error:'Invalid course details'},400);
  const {data,error}=await admin.from('abba_courses').update({title:body.title.trim(),description:body.description.trim(),updated_at:new Date().toISOString()}).eq('id',id).select('id,title,description,total_lessons,is_published,updated_at').maybeSingle();if(error)throw error;if(!data)return json({error:'Course not found'},404);return json({course:data});
 }
 if(body.action==='list-lessons'){
  const {data:course,error:ce}=await admin.from('abba_courses').select('id,total_lessons').eq(body.course_id?'id':'slug',String(body.course_id||'annual-program')).maybeSingle();if(ce)throw ce;if(!course)return json({error:'Course not found'},404);
  const {data,error}=await admin.from('abba_lessons').select('id,course_id,lesson_number,title,description,duration_minutes,release_at,is_published,mux_asset_id,mux_playback_id,transcript,transcript_cues,summary,key_points,attachments,updated_at').eq('course_id',course.id).lte('lesson_number',course.total_lessons).order('lesson_number');if(error)throw error;return json({lessons:data||[]});
 }
 if(body.action==='update-lesson'){
  const lessonId=String(body.lesson_id||'');const patch:any={updated_at:new Date().toISOString()};
  for(const [key,max] of [['title',250],['description',10000],['summary',20000],['transcript',200000]] as const){if(body[key]!==undefined){if(typeof body[key]!=='string'||body[key].length>max||(key==='title'&&!body[key].trim()))return json({error:'Invalid '+key},400);patch[key]=body[key].trim();}}
  if(body.key_points!==undefined){if(!Array.isArray(body.key_points)||body.key_points.length>30||body.key_points.some((x:any)=>typeof x!=='string'||x.length>2000))return json({error:'Invalid key points'},400);patch.key_points=body.key_points;}
  if(body.release_at===null)patch.release_at=null;else if(body.release_at!==undefined){if(typeof body.release_at!=='string'||!Number.isFinite(Date.parse(body.release_at)))return json({error:'Invalid release date'},400);patch.release_at=new Date(body.release_at).toISOString();}
  if(body.is_published!==undefined){if(typeof body.is_published!=='boolean')return json({error:'Invalid publication state'},400);patch.is_published=body.is_published;}
  let query=admin.from('abba_lessons').update(patch).eq('id',lessonId);if(typeof body.expected_updated_at==='string')query=query.eq('updated_at',body.expected_updated_at);
  const {data,error}=await query.select('id,title,description,release_at,is_published,summary,transcript,key_points,updated_at').maybeSingle();if(error)throw error;if(!data)return json({error:'Lesson changed or not found. Refresh before saving.'},409);return json({ok:true,lesson:data});
 }
 if(body.action==='add-resource'){
   const lessonId=String(body.lesson_id||''); const r=body.resource||{}; const path=String(r.path||''); const name=String(r.name||'').trim(); const type=String(r.type||'document');
   if(!lessonId||!path.startsWith(lessonId+'/')||!name)return json({error:'Invalid resource'},400); if(!['audio','image','document'].includes(type))return json({error:'Unsupported resource type'},400);
   const {data:lesson,error:le}=await admin.from('abba_lessons').select('attachments').eq('id',lessonId).maybeSingle(); if(le)throw le; if(!lesson)return json({error:'Lesson not found'},404);
   const attachments=attachmentsOf(lesson.attachments); const item={id:String(r.id||crypto.randomUUID()),name,type,path,mime:String(r.mime||''),size:Number(r.size||0),created_at:new Date().toISOString()}; attachments.push(item);
   const {data:saved,error}=await admin.from('abba_lessons').update({attachments,updated_at:new Date().toISOString()}).eq('id',lessonId).select('updated_at').single();if(error)throw error;return json({ok:true,attachments,updated_at:saved.updated_at});
 }
 if(body.action==='rename-resource'){
   const lessonId=String(body.lesson_id||''),resourceId=String(body.resource_id||''),name=String(body.name||'').trim(); if(!lessonId||!resourceId||!name)return json({error:'Invalid resource update'},400);
   const {data:lesson,error:le}=await admin.from('abba_lessons').select('attachments').eq('id',lessonId).maybeSingle(); if(le)throw le; if(!lesson)return json({error:'Lesson not found'},404);
   const attachments=attachmentsOf(lesson.attachments).map((x:any)=>String(x.id)===resourceId?{...x,name}:x); const {data:saved,error}=await admin.from('abba_lessons').update({attachments,updated_at:new Date().toISOString()}).eq('id',lessonId).select('updated_at').single();if(error)throw error;return json({ok:true,attachments,updated_at:saved.updated_at});
 }
 if(body.action==='delete-resource'){
   const lessonId=String(body.lesson_id||''),resourceId=String(body.resource_id||''); if(!lessonId||!resourceId)return json({error:'Invalid resource'},400);
   const {data:lesson,error:le}=await admin.from('abba_lessons').select('attachments').eq('id',lessonId).maybeSingle(); if(le)throw le; if(!lesson)return json({error:'Lesson not found'},404);
   const attachments=attachmentsOf(lesson.attachments); const target=attachments.find((x:any)=>String(x.id)===resourceId); if(!target)return json({error:'Resource not found'},404);
   if(target.path){const {error:se}=await admin.storage.from(RESOURCE_BUCKET).remove([String(target.path)]); if(se)throw se;}
   const next=attachments.filter((x:any)=>String(x.id)!==resourceId); const {data:saved,error}=await admin.from('abba_lessons').update({attachments:next,updated_at:new Date().toISOString()}).eq('id',lessonId).select('updated_at').single();if(error)throw error;return json({ok:true,attachments:next,updated_at:saved.updated_at});
 }
 const muxId=Deno.env.get('MUX_TOKEN_ID'); const muxSecret=Deno.env.get('MUX_TOKEN_SECRET'); if(!muxId||!muxSecret)return json({error:'Mux credentials are not configured'},500); const muxAuth='Basic '+btoa(`${muxId}:${muxSecret}`);
 if(body.action==='create-upload'){const lessonId=String(body.lesson_id||''); const {data:lesson}=await admin.from('abba_lessons').select('id,title').eq('id',lessonId).maybeSingle(); if(!lesson)return json({error:'Lesson not found'},404); const r=await fetch('https://api.mux.com/video/v1/uploads',{method:'POST',headers:{Authorization:muxAuth,'Content-Type':'application/json'},body:JSON.stringify({cors_origin:allowedOrigins.has(origin)?origin:'https://prayerandfire.org',new_asset_settings:{playback_policies:['public'],video_quality:'basic',passthrough:lessonId,inputs:[{generated_subtitles:[{language_code:'auto',name:'Auto captions'}]}]}})}); let j:any={}; try{j=await r.json()}catch{} if(!r.ok){const msg=j?.error?.message||j?.message||`HTTP ${r.status}`; const type=j?.error?.type||j?.type||''; return json({error:`Mux upload creation failed: ${msg}${type?` (${type})`:''}`},r.status);} return json({upload_id:j.data.id,upload_url:j.data.url});}
 if(body.action==='upload-status'){const uploadId=String(body.upload_id||''); const lessonId=String(body.lesson_id||''); const ur=await fetch(`https://api.mux.com/video/v1/uploads/${encodeURIComponent(uploadId)}`,{headers:{Authorization:muxAuth}}); const uj=await ur.json(); if(!ur.ok){const msg=uj?.error?.message||uj?.message||`HTTP ${ur.status}`; return json({error:`Could not read upload status: ${msg}`},ur.status);} const assetId=uj.data?.asset_id; if(!assetId)return json({ready:false,status:uj.data?.status||'waiting'}); const arq=await fetch(`https://api.mux.com/video/v1/assets/${encodeURIComponent(assetId)}`,{headers:{Authorization:muxAuth}}); const aj=await arq.json(); if(!arq.ok){const msg=aj?.error?.message||aj?.message||`HTTP ${arq.status}`; return json({error:`Could not read video asset: ${msg}`},arq.status);} const asset=aj.data; if(asset.status!=='ready')return json({ready:false,status:asset.status,asset_id:assetId}); const playbackId=asset.playback_ids?.[0]?.id; if(!playbackId)return json({error:'Video is ready but has no playback ID'},409); const minutes=Math.max(1,Math.ceil(Number(asset.duration||0)/60)); const {data:saved,error}=await admin.from('abba_lessons').update({mux_asset_id:asset.id,mux_playback_id:playbackId,duration_minutes:minutes,updated_at:new Date().toISOString()}).eq('id',lessonId).select('updated_at').single();if(error)throw error;return json({ready:true,asset_id:asset.id,playback_id:playbackId,duration_minutes:minutes,updated_at:saved.updated_at});}
 if(body.action==='transcription-status'){
   const lessonId=String(body.lesson_id||'');
   const {data:lesson,error:le}=await admin.from('abba_lessons').select('id,mux_asset_id,mux_playback_id,transcript,transcript_cues,summary,key_points').eq('id',lessonId).maybeSingle(); if(le)throw le; if(!lesson?.mux_asset_id||!lesson?.mux_playback_id)return json({error:'Video is not ready yet'},409);
   const arq=await fetch(`https://api.mux.com/video/v1/assets/${encodeURIComponent(lesson.mux_asset_id)}`,{headers:{Authorization:muxAuth}}); const aj=await arq.json(); if(!arq.ok)return json({error:aj?.error?.message||'Could not read video asset'},arq.status);
   const tracks=aj.data?.tracks||[]; const textTrack=tracks.find((t:any)=>t.type==='text'&&t.text_source==='generated_vod');
   if(textTrack?.status==='ready'){
     let transcript=lesson.transcript||''; let cues=Array.isArray(lesson.transcript_cues)?lesson.transcript_cues:[];
     if(!transcript){const tr=await fetch(`https://stream.mux.com/${encodeURIComponent(lesson.mux_playback_id)}/text/${encodeURIComponent(textTrack.id)}.txt`); if(tr.ok)transcript=(await tr.text()).trim();}
     if(!cues.length){const vr=await fetch(`https://stream.mux.com/${encodeURIComponent(lesson.mux_playback_id)}/text/${encodeURIComponent(textTrack.id)}.vtt`); if(vr.ok)cues=parseVtt(await vr.text());}
     const gen=makeSummary(transcript); const summary=lesson.summary||gen.summary; const key_points=(Array.isArray(lesson.key_points)&&lesson.key_points.length)?lesson.key_points:gen.key_points;
     const {data:saved,error}=await admin.from('abba_lessons').update({transcript,transcript_cues:cues,summary,key_points,updated_at:new Date().toISOString()}).eq('id',lessonId).select('updated_at').single();if(error)throw error;
     return json({status:'ready',transcript,transcript_cues:cues,summary,key_points,updated_at:saved.updated_at});
   }
   if(textTrack)return json({status:textTrack.status||'preparing'});
   const audio=tracks.find((t:any)=>t.type==='audio'); if(!audio?.id)return json({status:'waiting_for_audio'});
   const gr=await fetch(`https://api.mux.com/video/v1/assets/${encodeURIComponent(lesson.mux_asset_id)}/tracks/${encodeURIComponent(audio.id)}/generate-subtitles`,{method:'POST',headers:{Authorization:muxAuth,'Content-Type':'application/json'},body:JSON.stringify({generated_subtitles:[{language_code:'auto',name:'Auto captions'}]})}); let gj:any={}; try{gj=await gr.json()}catch{} if(!gr.ok){const msg=gj?.error?.message||gj?.message||`HTTP ${gr.status}`; return json({error:`Transcript generation failed: ${msg}`},gr.status);} return json({status:'preparing'});
 }
 return json({error:'Unknown action'},400);
}catch(e){return json({error:e instanceof Error?e.message:'Unexpected error'},500);}});
