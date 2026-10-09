(()=>{
const contact=document.querySelector('[data-page="contact"] .contactGrid');
if(contact){
 const card=document.createElement('div');card.className='subscribeCard card';
 card.innerHTML='<h3>Prayer Request</h3><p>Send your prayer request privately to the Prayer & Fire team.</p><form id="prayerRequestForm"><input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none"><input class="field" name="name" placeholder="Name" maxlength="120" required><input class="field" name="email" type="email" placeholder="Email" maxlength="254" required><input class="field" name="country" placeholder="Country (optional)" maxlength="100"><textarea class="field" name="message" placeholder="How can we pray for you?" rows="5" minlength="10" maxlength="5000" required style="width:100%;resize:vertical"></textarea><button class="supportBtn primaryBtn" type="submit">Send Prayer Request</button><p class="status" id="prayerRequestStatus" role="status"></p></form>';
 const subscribe=document.querySelector('#subscribeForm')?.closest('.subscribeCard');if(subscribe)contact.insertBefore(card,subscribe);else contact.appendChild(card);
 const form=card.querySelector('form'),status=card.querySelector('#prayerRequestStatus');
 form.addEventListener('submit',async e=>{
 e.preventDefault();const btn=form.querySelector('button[type="submit"]');btn.disabled=true;status.textContent='Sending...';
 try{const client=await getSb();if(!client)throw Error('Connection unavailable');const fd=new FormData(form);
 const body=Object.fromEntries(['name','email','country','message','website'].map(k=>[k,String(fd.get(k)||'').trim()]));
 const {data,error}=await client.functions.invoke('submit-prayer-request',{body});if(error||!data?.success)throw Error(data?.error||'Please try again');
 form.reset();status.textContent='Thank you. Your prayer request has been received.';
 }catch(err){status.textContent='Unable to send: '+err.message}finally{btn.disabled=false}
 });
}
const tabs=document.querySelector('.adminTabs'),parent=document.querySelector('#dashboardBox');
if(!tabs||!parent)return;
const btn=document.createElement('button');btn.type='button';btn.dataset.tab='prayerRequestsAdmin';btn.textContent='Prayer Requests';tabs.appendChild(btn);
const section=document.createElement('section');section.className='adminSection';section.dataset.adminSection='prayerRequestsAdmin';
section.innerHTML='<h3>Prayer Requests / Inbox</h3><p>Requests sent through the website. Direct emails remain in Gmail.</p><button type="button" class="adminBtn" id="refreshPrayerInbox">Refresh Inbox</button> <button type="button" class="adminBtn" id="toggleArchivedPrayers">View Archived</button><p class="status" id="prayerInboxStatus"></p><div id="prayerInboxList"></div>';
const sections=parent.querySelector('.adminSection');sections?.parentNode.appendChild(section);
const box=section.querySelector('#prayerInboxList'),info=section.querySelector('#prayerInboxStatus');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let showArchived=false;
function confirmPermanentDeletion(name){
 return new Promise(resolve=>{
  const overlay=document.createElement('div');
  overlay.setAttribute('role','presentation');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.76);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px';
  const dialog=document.createElement('div');
  dialog.setAttribute('role','alertdialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','confirmDeletePrayerTitle');
  dialog.style.cssText='background:#18191c;color:#fff;border:1px solid #666;border-radius:16px;padding:24px;width:min(100%,420px);box-shadow:0 16px 45px #0008';
  dialog.innerHTML='<h3 id="confirmDeletePrayerTitle" style="margin-top:0">Delete prayer request?</h3><p>This permanently deletes the request and cannot be undone.</p>';
  const buttons=document.createElement('div');buttons.style.cssText='display:flex;gap:12px;justify-content:flex-end;flex-wrap:wrap;margin-top:20px';
  const cancel=document.createElement('button');cancel.type='button';cancel.className='adminBtn';cancel.textContent='Cancel';
  const yes=document.createElement('button');yes.type='button';yes.className='adminBtn danger';yes.textContent='Delete permanently';
  function finish(answer){document.removeEventListener('keydown',onKey);overlay.remove();resolve(answer)}
  function onKey(e){if(e.key==='Escape')finish(false)}
  cancel.addEventListener('click',()=>finish(false));yes.addEventListener('click',()=>finish(true));
  overlay.addEventListener('click',e=>{if(e.target===overlay)finish(false)});
  buttons.append(cancel,yes);dialog.appendChild(buttons);overlay.appendChild(dialog);document.body.appendChild(overlay);
  document.addEventListener('keydown',onKey);cancel.focus();
 });
}
async function refresh(){
 info.textContent='Loading...';
 try{const client=await getSb();const {data:{user}}=await client.auth.getUser();if(!user)throw Error('Admin sign-in required');
 const {data,error}=await client.from('prayer_requests').select('id,name,email,country,message,status,created_at,archived_at').order('created_at',{ascending:false}).limit(200);if(error)throw error;
 box.replaceChildren();const visible=(data||[]).filter(item=>showArchived?Boolean(item.archived_at):!item.archived_at);for(const item of visible){
 const row=document.createElement('div');row.className='adminRow';row.style.cssText='display:block;padding:16px;margin:12px 0;overflow-wrap:anywhere';
 const a=document.createElement('a');a.className='adminBtn';a.textContent='Reply by email: '+item.email;a.href='mailto:'+item.email+'?subject='+encodeURIComponent('Re: Prayer Request - Prayer & Fire')+'&body='+encodeURIComponent('\n\n--- Original prayer request ---\nFrom: '+item.name+'\nDate: '+new Date(item.created_at).toLocaleString()+'\nCountry: '+(item.country||'')+'\n\n'+item.message);a.style.display='inline-block';
 row.innerHTML='<strong>'+esc(item.name)+'</strong> · '+esc(new Date(item.created_at).toLocaleString())+'<p>'+esc(item.country)+'</p><p style="white-space:pre-wrap">'+esc(item.message)+'</p>';
 row.appendChild(a);const label=document.createElement('label');label.textContent=' Status: ';const select=document.createElement('select');select.className='field';
 for(const [value,name] of [['new','New'],['in_progress','In progress'],['answered','Answered']]){const o=document.createElement('option');o.value=value;o.textContent=name;select.appendChild(o)}
 select.value=item.status;select.addEventListener('change',async()=>{const {error}=await client.from('prayer_requests').update({status:select.value}).eq('id',item.id);if(error){select.value=item.status;info.textContent=error.message}else{item.status=select.value;info.textContent='Status saved.'}});
 label.appendChild(select);row.appendChild(label);
 const controls=document.createElement('div');controls.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-top:12px';
 const archive=document.createElement('button');archive.type='button';archive.className='adminBtn';archive.textContent=item.archived_at?'Restore':'Archive';
 archive.addEventListener('click',async()=>{archive.disabled=true;const {error}=await client.from('prayer_requests').update({archived_at:item.archived_at?null:new Date().toISOString()}).eq('id',item.id);if(error){archive.disabled=false;info.textContent='Unable to update: '+error.message}else await refresh()});
 const remove=document.createElement('button');remove.type='button';remove.className='adminBtn danger';remove.textContent='Delete permanently';
 remove.addEventListener('click',async()=>{
 if(!await confirmPermanentDeletion(item.name))return;
 remove.disabled=true;remove.textContent='Deleting...';info.textContent='Deleting request...';
 try{
  const {data:deleted,error}=await client.from('prayer_requests').delete().eq('id',item.id).select('id');
  if(error)throw error;
  if(!deleted?.some(record=>record.id===item.id))throw Error('The server did not delete this request. Check administrator permissions.');
  await refresh();
 }catch(error){info.textContent='Unable to delete: '+error.message}
 finally{remove.disabled=false;remove.textContent='Delete permanently'}
});
 controls.append(archive,remove);row.appendChild(controls);box.appendChild(row)
 }
 info.textContent=visible.length+(showArchived?' archived request(s)':' active request(s)');
 }catch(e){info.textContent='Unable to load inbox: '+e.message}
}
btn.addEventListener('click',()=>{tabs.querySelectorAll('button').forEach(t=>t.classList.remove('active'));btn.classList.add('active');parent.querySelectorAll('.adminSection').forEach(s=>s.classList.toggle('active',s===section));refresh()});
section.querySelector('#refreshPrayerInbox').addEventListener('click',refresh);
section.querySelector('#toggleArchivedPrayers').addEventListener('click',e=>{showArchived=!showArchived;e.currentTarget.textContent=showArchived?'View Active':'View Archived';refresh()});
})();