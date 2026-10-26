import {createClient} from 'npm:@supabase/supabase-js@2.58.0';
const ACADEMY_URL='https://yecywtxbuhfukergbwfc.supabase.co';
const ACADEMY_KEY='sb_publishable_jFIuvZYIs1b-6IjqCnDPDw_BDivhFKs';
const DELIVERY_URL='https://xikmhnulxksadgvzajdk.supabase.co/functions/v1/abba-admin-email';
const allowedOrigins=new Set(['https://prayerandfire.org','https://www.prayerandfire.org']);
const escapeHtml=(v:string)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
function personalize(text:string,name:string){return text.replace(/\{\{(?:nombre|name|nome)\}\}/g,name);}
function chooseRecipients(students:any[],ids:unknown,mode:string,content:any){
 if(!Array.isArray(ids)||!ids.length||ids.length>100||!['auto','pt','en'].includes(mode))throw Error('Selecciona entre 1 y 100 estudiantes y un idioma válido.');
 const unique=[...new Set(ids.map(String))],selected=unique.map(id=>students.find(s=>s.id===id));
 if(selected.some(s=>!s||!s.confirmed))throw Error('Algún destinatario no tiene una cuenta de ABBA con correo confirmado. Actualiza la lista.');
 const seen=new Set();return selected.filter(s=>{const email=s.email.toLowerCase();if(seen.has(email))return false;seen.add(email);return true;}).map(s=>{const language=mode==='auto'?s.language:mode,variant=content?.[language];const subject=String(variant?.subject||'').trim(),message=String(variant?.message||'').trim();if(!subject||subject.length>180||/[\r\n]/.test(subject)||!message||message.length>15000)throw Error('Completa asunto y mensaje para '+language.toUpperCase()+'.');return {user_id:s.id,email:s.email,name:s.name,language,subject:personalize(subject,s.name),message:personalize(message,s.name)};});
}
Deno.serve(async request=>{
 const origin=request.headers.get('origin')||'',headers={'Access-Control-Allow-Origin':allowedOrigins.has(origin)?origin:'https://prayerandfire.org','Vary':'Origin','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
 const reply=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers});
 if(origin&&!allowedOrigins.has(origin))return reply({error:'Origen no permitido.'},403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(request.method!=='POST')return reply({error:'Método no permitido.'},405);
 try{
  const token=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');if(!token)return reply({error:'Inicia sesión.'},401);
  const client=createClient(ACADEMY_URL,ACADEMY_KEY,{global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error:authError}=await client.auth.getUser(token);if(authError||!user)return reply({error:'La sesión expiró. Vuelve a entrar.'},401);
  if(user.app_metadata?.abba_admin!==true)return reply({error:'Acceso exclusivo de administración de ABBA.'},403);
  let body;try{body=await request.json()}catch{return reply({error:'Solicitud inválida.'},400)}
  const isDelivery=Deno.env.get('SUPABASE_URL')!==ACADEMY_URL;
  if(isDelivery){
   if(!['send','provider-status'].includes(body.action))return reply({error:'Acción no permitida.'},400);
   const key=String(Deno.env.get('BREVO_API_KEY')||'').trim().replace(/^['"]|['"]$/g,'');
   if(body.action==='provider-status')return reply({configured:!!key,sender:'updates@prayerandfire.org'});
   if(!key)return reply({error:'El servicio de correo no está configurado.'},503);
   if(body.confirmed!==true)return reply({error:'Confirma la vista previa antes de enviar.'},400);
   const {data:campaign,error:ce}=await client.from('abba_email_campaigns').select('*').eq('id',String(body.campaign_id||'')).eq('created_by',user.id).maybeSingle();if(ce||!campaign)return reply({error:'Vista previa no encontrada.'},404);
   if(campaign.status!=='draft')return reply({error:'Este envío ya fue iniciado. Consulta el historial para evitar duplicados.'},409);
   if(Date.parse(campaign.expires_at)<=Date.now())return reply({error:'La vista previa expiró. Prepara una nueva.'},409);
   const {data:recipients,error:re}=await client.from('abba_email_recipients').select('*').eq('campaign_id',campaign.id).order('email');if(re||!recipients?.length||recipients.length!==campaign.recipient_count)return reply({error:'No se pudo verificar la lista de destinatarios.'},409);
   const {data:claimed,error:claimError}=await client.from('abba_email_campaigns').update({status:'sending'}).eq('id',campaign.id).eq('status','draft').select('id').maybeSingle();if(claimError||!claimed)return reply({error:'Otro envío ya está procesando esta vista previa.'},409);
   let accepted=0,failed=0,uncertain=0;
   for(const recipient of recipients){
    const {data:reserved,error:reserveError}=await client.from('abba_email_recipients').update({status:'processing',updated_at:new Date().toISOString()}).eq('id',recipient.id).eq('status','pending').select('id').maybeSingle();if(reserveError||!reserved){uncertain++;break;}
    let status='uncertain',providerId:string|null=null,error:string|null=null;
    try{
     const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':key,'Content-Type':'application/json',Accept:'application/json'},signal:AbortSignal.timeout(12000),body:JSON.stringify({sender:{name:'ABBA Academy · Prayer & Fire',email:'updates@prayerandfire.org'},replyTo:{name:'ABBA Academy',email:'prayerandfireglobal@gmail.com'},to:[{email:recipient.email,name:recipient.name}],subject:recipient.subject,textContent:recipient.message,tags:['abba-academy'],headers:{IdempotencyKey:recipient.id},htmlContent:'<!doctype html><html lang="'+recipient.language+'"><body style="margin:0;background:#fff8f5;font-family:Arial,sans-serif"><div style="max-width:620px;margin:auto;padding:24px"><h1 style="color:#650820">ABBA Academy</h1><div style="background:white;padding:24px;line-height:1.7;white-space:pre-wrap">'+escapeHtml(recipient.message)+'</div><p style="font-size:12px;color:#76525b">'+(recipient.language==='pt'?'Comunicação acadêmica referente ao seu cadastro na ABBA Academy.':'Academic communication regarding your ABBA Academy registration.')+'</p></div></body></html>'})});
     const result=await response.json().catch(()=>({}));if(response.ok){status='accepted';providerId=String(result.messageId||'');accepted++;}else{status='failed';error=String(result.message||'El proveedor rechazó el correo.').slice(0,250);failed++;}
    }catch{error='No se confirmó la respuesta del proveedor. Revisa el historial antes de intentar otro envío.';uncertain++;}
    const {error:saveError}=await client.from('abba_email_recipients').update({status,provider_message_id:providerId,error,updated_at:new Date().toISOString()}).eq('id',recipient.id);if(saveError)return reply({error:'El proveedor fue contactado, pero no se pudo guardar el resultado. No repitas el envío; consulta el historial.'},503);
    if(status==='uncertain')break;
   }
   const status=accepted===recipients.length?'completed':accepted>0?'partial':'failed';
   const {error:finalError}=await client.from('abba_email_campaigns').update({status,accepted_count:accepted,failed_count:failed,uncertain_count:uncertain,completed_at:new Date().toISOString()}).eq('id',campaign.id);if(finalError)return reply({error:'El envío terminó, pero el resumen no pudo guardarse. Consulta los destinatarios en el historial.'},503);
   return reply({status,accepted,failed,uncertain,pending:recipients.length-accepted-failed-uncertain});
  }
  const admin=createClient(ACADEMY_URL,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
  async function roster(){const rows:any[]=[];for(let page=1;page<=20;page++){const {data,error}=await admin.auth.admin.listUsers({page,perPage:500});if(error)throw Error('No se pudieron cargar los estudiantes.');rows.push(...data.users.filter(u=>u.user_metadata?.academy_pre_registration===true&&u.email).map(u=>({id:u.id,name:String(u.user_metadata?.full_name||u.email),email:u.email!.toLowerCase(),language:u.user_metadata?.preferred_language==='pt'?'pt':'en',confirmed:!!u.email_confirmed_at,admission:u.app_metadata?.academy_admission||'pending'})));if(data.users.length<500)return rows;}throw Error('La lista es demasiado grande. Contacta a administración.');}
  if(['send','provider-status'].includes(body.action)){
   const response=await fetch(DELIVERY_URL,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});return reply(await response.json(),response.status);
  }
  if(body.action==='recipients'){const students=await roster();const {data:scholarships,error}=await admin.from('abba_scholarship_applications').select('user_id,status');if(error)throw error;return reply({students:students.map(s=>({...s,scholarship:scholarships?.find(r=>r.user_id===s.id)?.status||'none'}))});}
  if(body.action==='prepare'){
   let recipients;try{recipients=chooseRecipients(await roster(),body.recipient_ids,String(body.language_mode),body.content)}catch(error){return reply({error:error instanceof Error?error.message:'Datos no válidos.'},400)}
   const {data:campaign,error}=await admin.from('abba_email_campaigns').insert({created_by:user.id,language_mode:body.language_mode,recipient_count:recipients.length}).select('*').single();if(error)throw error;
   const {data:saved,error:saveError}=await admin.from('abba_email_recipients').insert(recipients.map(r=>({...r,campaign_id:campaign.id}))).select('id,email,name,language,subject,message,status');if(saveError){await admin.from('abba_email_campaigns').update({status:'failed'}).eq('id',campaign.id);throw saveError;}return reply({campaign,recipients:saved});
  }
  if(body.action==='history'){const {data,error}=await admin.from('abba_email_campaigns').select('*').order('created_at',{ascending:false}).limit(30);if(error)throw error;return reply({campaigns:data||[]});}
  if(body.action==='detail'){const {data,error}=await admin.from('abba_email_recipients').select('id,email,name,language,subject,message,status,error,updated_at').eq('campaign_id',String(body.campaign_id||''));if(error)throw error;return reply({recipients:data||[]});}
  return reply({error:'Acción no válida.'},400);
 }catch(error){console.error('ABBA email operation failed',error instanceof Error?error.message:'Unknown error');return reply({error:'No se pudo completar la operación de correo. Intenta nuevamente o revisa el historial si ya confirmaste un envío.'},500);}
});
