(()=>{
'use strict';
const player=document.getElementById('muxPlayer');const wrap=document.getElementById('videoWrap');const select=document.getElementById('captionLanguageSelect');
if(!player||!wrap)return;
const layer=document.createElement('div');layer.id='abbaOnScreenCaptions';layer.setAttribute('aria-live','off');layer.style.cssText='position:absolute;bottom:12%;left:5%;width:90%;z-index:4;text-align:center;pointer-events:none;color:white;font-size:clamp(14px,2.7vw,22px);line-height:1.42;font-weight:700;text-shadow:0 2px 4px #000,0 0 9px #000;';
if(getComputedStyle(wrap).position==='static')wrap.style.position='relative';wrap.appendChild(layer);
let latest='';
function cuesFor(lesson,lang){if(!lesson)return[];if(lang==='en'){for(const k of ['transcript_cues_en','english_transcript_cues','transcript_en_cues'])if(Array.isArray(lesson[k])&&lesson[k].length)return lesson[k];return [];}return Array.isArray(lesson.transcript_cues)?lesson.transcript_cues:[]}
function tick(){const lesson=typeof currentLesson==='undefined'?null:currentLesson;if(!lesson||document.getElementById('lessonView')?.classList.contains('hidden')){layer.textContent='';return;}const lang=select?.value||'pt';const cues=cuesFor(lesson,lang);const time=Number(player.currentTime)||0;let text='';for(let i=0;i<cues.length;i++){const cue=cues[i],start=Number(cue.start)||0,next=cues[i+1],end=Number(cue.end)||Number(cue.stop)||Number(next?.start)||start+6;if(time>=start&&time<Math.max(end,start+.4)){text=String(cue.text||'');break;}}if(text!==latest){layer.textContent=text;latest=text;}}
player.addEventListener('timeupdate',tick);player.addEventListener('seeked',tick);select?.addEventListener('change',()=>{latest='';tick()});setInterval(tick,900);
})();
