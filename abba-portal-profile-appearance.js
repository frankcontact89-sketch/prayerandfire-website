(()=>{
'use strict';
const $=id=>document.getElementById(id);
const bucket='abba-student-avatars';
let user=null,photoURL=null,installed=false,theme='system';
const copy={
 en:{photo:'Profile photo',change:'Change photo',remove:'Remove photo',appearance:'Appearance',light:'Light mode',dark:'Dark mode',system:'Use device settings',hint:'Your appearance preference is saved for your account.',help:'JPG, PNG or WebP, up to 3 MB.',uploading:'Uploading your photo…',saved:'Photo updated',removed:'Photo removed',bad:'Select a JPG, PNG or WebP image under 3 MB.',error:'Unable to update the photo. Please try again.',initial:'Profile picture'},
 pt:{photo:'Foto do perfil',change:'Alterar foto',remove:'Remover foto',appearance:'Aparência',light:'Modo claro',dark:'Modo escuro',system:'Usar configuração do dispositivo',hint:'A preferência de aparência fica salva na sua conta.',help:'JPG, PNG ou WebP, até 3 MB.',uploading:'Enviando sua foto…',saved:'Foto atualizada',removed:'Foto removida',bad:'Selecione JPG, PNG ou WebP de até 3 MB.',error:'Não foi possível atualizar a foto. Tente novamente.',initial:'Foto de perfil'},
 es:{photo:'Foto de perfil',change:'Cambiar foto',remove:'Quitar foto',appearance:'Apariencia',light:'Modo claro',dark:'Modo oscuro',system:'Usar configuración del dispositivo',hint:'Tu preferencia de apariencia queda guardada en tu cuenta.',help:'JPG, PNG o WebP, hasta 3 MB.',uploading:'Subiendo tu foto…',saved:'Foto actualizada',removed:'Foto eliminada',bad:'Selecciona JPG, PNG o WebP de hasta 3 MB.',error:'No se pudo actualizar la foto. Inténtalo otra vez.',initial:'Foto de perfil'}
};
const lang=()=>copy[document.documentElement.lang]?document.documentElement.lang:'en';
const t=k=>copy[lang()][k]||copy.en[k];
const validTheme=x=>['system','light','dark'].includes(x)?x:'system';
const themeKey=id=>'abba_appearance_'+id;
const media=window.matchMedia?.('(prefers-color-scheme: dark)');
function applyTheme(){
 document.documentElement.dataset.abbaTheme=theme==='dark'||(theme==='system'&&media?.matches)?'dark':'light';
 document.documentElement.style.colorScheme=document.documentElement.dataset.abbaTheme;
 for(const b of document.querySelectorAll('[data-abba-mode]')){const selected=b.dataset.abbaMode===theme;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('is-selected',selected)}
}
media?.addEventListener?.('change',()=>{if(theme==='system')applyTheme()});
function locale(){
 for(const el of document.querySelectorAll('[data-abba-label]'))el.textContent=t(el.dataset.abbaLabel);
 const input=$('abbaAvatarFile');if(input)input.setAttribute('aria-label',t('change'));
 const title=$('abbaProfileAvatarButton');if(title)title.setAttribute('aria-label',t('change'));
}
function setStatus(message){const el=$('abbaAvatarStatus');if(el)el.textContent=message||''}
function install(){
 if(installed)return;const langSection=$('settingsLanguage'),settings=$('settingsPanel');if(!langSection||!settings)return;
 const section=document.createElement('section');section.className='settings-section abba-profile-settings';section.id='abbaProfileSettings';
 section.innerHTML=`<div class="settings-kicker" data-abba-label="photo"></div><div class="abba-avatar-editor"><button type="button" id="abbaProfileAvatarButton" class="abba-avatar-preview" aria-label="Change photo"><span id="abbaAvatarInitial">A</span><img id="abbaAvatarImage" alt="" hidden></button><div class="abba-avatar-actions"><div class="abba-avatar-btn-row"><button type="button" id="abbaAvatarChoose" class="abba-profile-btn" data-abba-label="change"></button><button type="button" id="abbaAvatarRemove" class="abba-profile-btn secondary" data-abba-label="remove"></button></div><small data-abba-label="help"></small></div></div><input id="abbaAvatarFile" type="file" accept="image/jpeg,image/png,image/webp" hidden><p id="abbaAvatarStatus" class="settings-help" role="status" aria-live="polite"></p><div class="settings-kicker abba-appearance-label" data-abba-label="appearance"></div><div class="abba-mode-options" role="group" aria-label="Appearance"><button type="button" data-abba-mode="light" data-abba-label="light"></button><button type="button" data-abba-mode="dark" data-abba-label="dark"></button><button type="button" data-abba-mode="system" data-abba-label="system"></button></div><p class="settings-help" data-abba-label="hint"></p>`;
 langSection.parentNode.insertBefore(section,langSection);
 $('abbaAvatarChoose').addEventListener('click',()=>$('abbaAvatarFile').click());
 $('abbaProfileAvatarButton').addEventListener('click',()=>$('abbaAvatarFile').click());
 $('abbaAvatarFile').addEventListener('change',onFile);
 $('abbaAvatarRemove').addEventListener('click',removeAvatar);
 document.querySelectorAll('[data-abba-mode]').forEach(b=>b.addEventListener('click',()=>changeTheme(b.dataset.abbaMode)));
 $('settingsBtn')?.addEventListener('click',()=>{void refresh()});
 $('languageSelect')?.addEventListener('change',()=>setTimeout(locale,20));
 installed=true;locale();applyTheme();
}
function setAvatar(url){
 if(photoURL?.startsWith('blob:'))URL.revokeObjectURL(photoURL);
 photoURL=url||null;
 const img=$('abbaAvatarImage'),initial=$('abbaAvatarInitial');
 if(img){img.hidden=!url;if(url)img.src=url;else img.removeAttribute('src')}
 if(initial)initial.hidden=!!url;
 $('abbaAvatarRemove').disabled=!user?.user_metadata?.abba_avatar_path;
 const icon=$('abbaHeaderAvatarImage');if(icon){icon.hidden=!url;if(url)icon.src=url;else icon.removeAttribute('src')}
 const fallback=$('abbaHeaderAvatarInitial');if(fallback)fallback.hidden=!!url;
}
function setupHeaderAvatar(){
 const head=$('abbaWelcome')?.querySelector('.aw-heading');if(!head||head.querySelector('.abba-header-avatar'))return;
 const button=document.createElement('button');button.type='button';button.className='abba-header-avatar';button.title=t('change');button.setAttribute('aria-label',t('change'));
 button.innerHTML='<span id="abbaHeaderAvatarInitial">A</span><img id="abbaHeaderAvatarImage" alt="" hidden>';
 button.addEventListener('click',()=>$('settingsBtn')?.click());head.insertBefore(button,head.firstChild);
}
async function refresh(){
 install();const {data:{user:actual}}=await db.auth.getUser();if(!actual){user=null;theme='system';applyTheme();return}
 user=actual;theme=validTheme(actual.user_metadata?.abba_theme||localStorage.getItem(themeKey(actual.id))||'system');applyTheme();locale();
 const name=String(actual.user_metadata?.full_name||actual.email||'A');const initials=name.trim().charAt(0).toUpperCase()||'A';
 for(const id of ['abbaAvatarInitial','abbaHeaderAvatarInitial'])if($(id))$(id).textContent=initials;
 setupHeaderAvatar();
 const path=actual.user_metadata?.abba_avatar_path;
 if(!path){setAvatar(null);return}
 const {data,error}=await db.storage.from(bucket).createSignedUrl(path,1800);
 if(error){console.warn('ABBA avatar',error.message);setAvatar(null);return}
 setAvatar(data.signedUrl);
}
async function onFile(e){
 const file=e.target.files?.[0];e.target.value='';if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>3145728){setStatus(t('bad'));return}
 if(!user)return;
 const choose=$('abbaAvatarChoose'),remove=$('abbaAvatarRemove');choose.disabled=remove.disabled=true;setStatus(t('uploading'));
 try{
  const img=await createImageBitmap(file);const canvas=document.createElement('canvas');const ratio=Math.min(1,640/Math.max(img.width,img.height));
  canvas.width=Math.max(1,Math.round(img.width*ratio));canvas.height=Math.max(1,Math.round(img.height*ratio));
  canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);img.close?.();
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.82));if(!blob)throw Error('Image conversion failed');
  const path=user.id+'/avatar.jpg';
  const upload=await db.storage.from(bucket).upload(path,blob,{contentType:'image/jpeg',cacheControl:'300',upsert:true});
  if(upload.error)throw upload.error;
  const update=await db.auth.updateUser({data:{abba_avatar_path:path}});if(update.error)throw update.error;
  user=update.data.user;await refresh();setStatus(t('saved'));
 }catch(err){console.error('ABBA avatar upload',err);setStatus(t('error'))}
 finally{choose.disabled=false;remove.disabled=false}
}
async function removeAvatar(){
 if(!user)return;
 const path=user.user_metadata?.abba_avatar_path;if(!path)return;
 $('abbaAvatarRemove').disabled=true;
 try{
  const result=await db.storage.from(bucket).remove([path]);if(result.error)throw result.error;
  const updated=await db.auth.updateUser({data:{abba_avatar_path:null}});if(updated.error)throw updated.error;
  user=updated.data.user;setAvatar(null);setStatus(t('removed'));
 }catch(err){console.error('ABBA avatar remove',err);setStatus(t('error'))}
 finally{$('abbaAvatarRemove').disabled=false}
}
async function changeTheme(mode){
 theme=validTheme(mode);applyTheme();
 if(!user)return;
 localStorage.setItem(themeKey(user.id),theme);
 const {error}=await db.auth.updateUser({data:{abba_theme:theme}});
 if(error)console.warn('ABBA theme sync',error.message);
}
db.auth.onAuthStateChange((event,session)=>{
 if(event==='SIGNED_OUT'){user=null;theme='system';applyTheme();setAvatar(null)}
 if(event==='SIGNED_IN'||event==='INITIAL_SESSION'){if(session?.user)queueMicrotask(()=>{void refresh()})}
});
document.addEventListener('DOMContentLoaded',()=>{install();void refresh()});
window.abbaProfileSettings={refresh,applyTheme};
})();
