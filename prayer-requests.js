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
section.innerHTML='<h3>Prayer Requests / Inbox</h3><p>Requests sent through the website. Direct emails remain in Gmail.</p><button type="button" class="adminBtn" id="refreshPrayerInbox">Refresh Inbox</button><p class="status" id="prayerInboxStatus"></p><div id="prayerInboxList"></div>';
const sections=parent.querySelector('.adminSection');sections?.parentNode.appendChild(section);
const box=section.querySelector('#prayerInboxList'),info=section.querySelector('#prayerInboxStatus');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function refresh(){
 info.textContent='Loading...';
 try{const client=await getSb();const {data:{user}}=await client.auth.getUser();if(!user)throw Error('Admin sign-in required');
 const {data,error}=await client.from('prayer_requests').select('id,name,email,country,message,status,created_at').order('created_at',{ascending:false}).limit(200);if(error)throw error;
 box.replaceChildren();for(const item of data||[]){
 const row=document.createElement('div');row.className='adminRow';row.style.cssText='display:block;padding:16px;margin:12px 0;overflow-wrap:anywhere';
 const a=document.createElement('a');a.className='adminBtn';a.textContent='Reply by email: '+item.email;a.href='mailto:'+encodeURIComponent(item.email)+'?subject='+encodeURIComponent('Re: Prayer Request - Prayer & Fire');a.style.display='inline-block';
 row.innerHTML='<strong>'+esc(item.name)+'</strong> · '+esc(new Date(item.created_at).toLocaleString())+'<p>'+esc(item.country)+'</p><p style="white-space:pre-wrap">'+esc(item.message)+'</p>';
 row.appendChild(a);const label=document.createElement('label');label.textContent=' Status: ';const select=document.createElement('select');select.className='field';
 for(const [value,name] of [['new','New'],['in_progress','In progress'],['answered','Answered']]){const o=document.createElement('option');o.value=value;o.textContent=name;select.appendChild(o)}
 select.value=item.status;select.addEventListener('change',async()=>{const {error}=await client.from('prayer_requests').update({status:select.value}).eq('id',item.id);if(error){select.value=item.status;info.textContent=error.message}else{item.status=select.value;info.textContent='Status saved.'}});
 label.appendChild(select);row.appendChild(label);box.appendChild(row)
 }
 info.textContent=(data||[]).length+' request(s)';
 }catch(e){info.textContent='Unable to load inbox: '+e.message}
}
btn.addEventListener('click',()=>{tabs.querySelectorAll('button').forEach(t=>t.classList.remove('active'));btn.classList.add('active');parent.querySelectorAll('.adminSection').forEach(s=>s.classList.toggle('active',s===section));refresh()});
section.querySelector('#refreshPrayerInbox').addEventListener('click',refresh);
})();