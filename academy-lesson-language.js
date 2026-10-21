(()=>{
'use strict';
// Translate lesson materials only when a student selects English.
// Original Portuguese materials are retained and can be restored immediately.
const cache=new Map();let seq=0,lastKey='';
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const picker=document.getElementById('languageSelect');
async function translate(lesson,token){if(!lesson)return;const language=document.documentElement.lang;if(language!=='en')return;if(!lesson.__ptOriginal)lesson.__ptOriginal={transcript:lesson.transcript,transcript_cues:lesson.transcript_cues,summary:lesson.summary,key_points:lesson.key_points};
 const key=lesson.id+':en';try{let data=cache.get(key);if(!data){const {data:auth}=await db.auth.getSession();if(!auth?.session)return;for(let n=0;n<5;n++){const r=await fetch(SUPABASE_URL+'/functions/v1/abba-caption-translations',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+auth.session.access_token,apikey:SUPABASE_KEY},body:JSON.stringify({lesson_id:lesson.id,language:'en'})});if(!r.ok)break;const json=await r.json();if(json.status==='ready'){data=json;cache.set(key,data);break;}await delay(3500);}}if(!data||token!==seq||typeof currentLesson==='undefined'||currentLesson?.id!==lesson.id||document.documentElement.lang!=='en')return;lesson.transcript=data.transcript||'';lesson.transcript_cues=Array.isArray(data.transcript_cues)?data.transcript_cues:[];lesson.summary=data.summary||'';lesson.key_points=Array.isArray(data.key_points)?data.key_points:[];lesson.__abbaTranslatedLanguage='en';renderLessonResources(lesson);
 }catch(e){console.warn('ABBA lesson translation unavailable',e)}}
function restore(lesson){if(!lesson?.__ptOriginal)return;Object.assign(lesson,lesson.__ptOriginal);lesson.__abbaTranslatedLanguage='pt';renderLessonResources(lesson)}
function check(){const lesson=typeof currentLesson==='undefined'?null:currentLesson;if(!lesson||document.getElementById('lessonView')?.classList.contains('hidden'))return;const l=document.documentElement.lang;const key=lesson.id+':'+l;if(key===lastKey)return;lastKey=key;const token=++seq;if(l==='en')translate(lesson,token);else restore(lesson);}
picker?.addEventListener('change',()=>{lastKey='';check()});setInterval(check,1200);
})();
