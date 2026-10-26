import {createClient} from "npm:@supabase/supabase-js@2.58.0";
const headers={"Access-Control-Allow-Origin":"https://prayerandfire.org","Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Content-Type":"application/json","Cache-Control":"no-store"};
function reply(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers})}
Deno.serve(async request=>{
 if(request.method==="OPTIONS")return new Response(null,{headers});
 if(!["GET","POST"].includes(request.method))return reply({error:"Method not allowed"},405);
 const jwt=request.headers.get("authorization")?.replace(/^Bearer /i,"");
 if(!jwt)return reply({error:"Sign in required"},401);
 const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),url=Deno.env.get("SUPABASE_URL");
 if(!service||!url)return reply({error:"Server configuration unavailable"},503);
 const supabase=createClient(url,service,{auth:{autoRefreshToken:false,persistSession:false}});
 const {data:{user},error}=await supabase.auth.getUser(jwt);
 if(error||!user)return reply({error:"Invalid session"},401);
 if(user.app_metadata?.abba_admin!==true)return reply({error:"Admin access required"},403);
 if(request.method==="POST"){
   let body;try{body=await request.json()}catch{return reply({error:"Invalid request"},400)}
   if(body?.action==='review-admission'){
    const {user_id,decision}=body;
    if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(String(user_id||''))||!['approved','rejected','pending'].includes(decision))return reply({error:'Invalid admission decision'},400);
    const {data:{user:student},error:studentError}=await supabase.auth.admin.getUserById(user_id);
    if(studentError||!student||student.user_metadata?.academy_pre_registration!==true)return reply({error:'Student not found'},404);
    if(student.app_metadata?.abba_admin===true)return reply({error:'Administrator accounts cannot be reviewed as students'},409);
    const {error:reviewError}=await supabase.auth.admin.updateUserById(user_id,{app_metadata:{...student.app_metadata,academy_admission:decision,academy_admission_reviewed_at:new Date().toISOString()}});
    if(reviewError)return reply({error:'Could not save admission decision'},500);
    return reply({status:decision,message:'Admission reviewed. Course access remains closed.'});
   }
   const {id,decision,percent}=body||{};
   if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(String(id||""))||!["approved","rejected"].includes(decision)||!(decision==="rejected"||(Number.isInteger(percent)&&percent>=0&&percent<=100)))
      return reply({error:"Invalid scholarship decision"},400);
   const {data:record,error:lookupError}=await supabase.from("abba_scholarship_applications").select("id,status,requested_percent").eq("id",id).maybeSingle();
   if(lookupError||!record)return reply({error:"Application not found"},404);
   if(body.expected_status&&record.status!==body.expected_status)return reply({error:"Application changed. Refresh before reviewing."},409);
   const update={status:decision,approved_percent:decision==="approved"?percent:null,reviewed_at:new Date().toISOString()};
   const {data:updated,error:updateError}=await supabase.from("abba_scholarship_applications").update(update).eq("id",id).eq("status",record.status).select("id,status,approved_percent").maybeSingle();
   if(updateError)return reply({error:"Could not save decision"},500);
   if(!updated)return reply({error:"Already reviewed"},409);
   return reply({result:updated,message:"Decision saved. Course access remains disabled."});
 }
 const requested=Number(new URL(request.url).searchParams.get("page")||1);
 const page=Number.isSafeInteger(requested)?Math.max(1,Math.min(1000,requested)):1;
 const {data,error:listError}=await supabase.auth.admin.listUsers({page,perPage:100});
 if(listError)return reply({error:"Unable to retrieve registrations"},500);
 const {data:scholarships,error:scholarshipError}=await supabase.from("abba_scholarship_applications").select("id,user_id,full_name,country,requested_percent,reason,status,approved_percent,created_at,reviewed_at,applicant_details").order("created_at",{ascending:false}).limit(150);
 if(scholarshipError)return reply({error:"Unable to retrieve scholarship applications"},500);
 const {data:enrollmentRows,error:enrollmentError}=await supabase.from("abba_enrollments").select("user_id,status").limit(1000);
 if(enrollmentError)return reply({error:"Unable to retrieve enrollment statuses"},500);
 return reply({scholarships:scholarships||[],enrollments:enrollmentRows||[],page,has_more:data.users.length===100,students:data.users.filter(u=>u.user_metadata?.academy_pre_registration===true).map(u=>({id:u.id,admission_status:u.app_metadata?.academy_admission||"pending",name:String(u.user_metadata?.full_name||""),email:u.email||"",country:String(u.user_metadata?.country||""),language:String(u.user_metadata?.preferred_language||"en"),created_at:u.created_at,confirmed:!!u.email_confirmed_at,last_sign_in_at:u.last_sign_in_at||null}))});
});
