const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module');
function runtime(slug,options={}){
 const state={admin:true,tableAdmin:true,coursePublished:false,lessonPublished:true,expires:null,writes:[],...options};let handler;
 const lesson={id:'lesson',course_id:'course',lesson_number:1,is_published:state.lessonPublished,release_at:null,mux_asset_id:'asset',mux_playback_id:'playback',transcript:'Text',transcript_cues:[{start:0,text:'text'}],summary:'Summary',key_points:[],attachments:[],updated_at:'old'};
 const user={id:'admin',email:'admin@example.test',app_metadata:{abba_admin:state.admin}};
 const student={id:'11111111-1111-4111-8111-111111111111',user_metadata:{academy_pre_registration:true},app_metadata:{}};
 const client={auth:{getUser:async()=>({data:{user:state.noAuth?null:user},error:state.noAuth?Error('No session'):null}),admin:{getUserById:async()=>({data:{user:student}}),updateUserById:async(id,patch)=>{state.writes.push({table:'auth',id,patch});return {error:null}}}},from(table){let patch=null;const q={select(){return q},eq(){return q},lte(){return q},order(){return q},update(value){patch=value;state.writes.push({table,patch});return q},async maybeSingle(){if(table==='abba_admins')return {data:state.tableAdmin?{email:user.email}:null};if(table==='abba_courses')return {data:{id:'course',total_lessons:40,is_published:state.coursePublished}};if(table==='abba_lessons')return {data:state.conflict&&patch?null:{...lesson,...patch}};if(table==='abba_enrollments')return {data:{id:'enrollment',expires_at:state.expires}};if(table==='abba_scholarship_applications')return {data:patch?{id:'id',...patch}:{id:'id',status:'approved'}};return {data:null}},then(resolve){resolve({data:table==='abba_courses'?[{id:'course',total_lessons:40}]:[lesson]})}};return q}};
 const source=fs.readFileSync('supabase/functions/'+slug+'/index.ts','utf8').replace(/^import .*;\n/,'');
 vm.runInNewContext(stripTypeScriptTypes(source),{createClient:()=>client,Deno:{env:{get:()=> 'server-only-placeholder'},serve:f=>handler=f},Response,Request,Headers,Date,crypto,btoa,console,fetch:()=>{throw Error('Unexpected external request')}});
 return {state,async call(body,method='POST',origin='https://prayerandfire.org'){return handler(new Request('https://example.test/function',{method,headers:{Origin:origin,Authorization:'Bearer test','Content-Type':'application/json'},...(method==='POST'?{body:JSON.stringify(body)}:{})}))}};
}
(async()=>{
 let r=runtime('abba-mux-admin');let response=await r.call({},'OPTIONS');assert.equal(response.headers.get('access-control-allow-origin'),'https://prayerandfire.org');
 assert.equal((await r.call({},'OPTIONS','https://evil.example')).status,403);
 assert.equal((await runtime('abba-mux-admin',{admin:false,tableAdmin:false}).call({action:'list-lessons'})).status,403);
 assert.equal((await runtime('abba-mux-admin',{noAuth:true}).call({action:'list-lessons'})).status,401);
 assert.equal((await r.call({action:'list-courses'})).status,200);
 assert.equal((await r.call({action:'update-lesson',lesson_id:'lesson',title:''})).status,400);
 assert.equal((await r.call({action:'update-lesson',lesson_id:'lesson',release_at:'invalid'})).status,400);
 response=await r.call({action:'update-lesson',lesson_id:'lesson',is_published:false});assert.equal(response.status,200);assert.equal((await response.json()).lesson.is_published,false);
 response=await r.call({action:'update-course',course_id:'course',title:'New title',description:'Description',is_published:true});assert.equal(response.status,200);assert.ok(!('is_published' in r.state.writes.at(-1).patch));
 assert.equal((await runtime('abba-mux-admin',{conflict:true}).call({action:'update-lesson',lesson_id:'lesson',title:'Changed',expected_updated_at:'stale'})).status,409);
 assert.equal((await runtime('abba-lesson-content').call({lesson_id:'lesson'})).status,403);
 assert.equal((await runtime('abba-lesson-content',{coursePublished:true,lessonPublished:false}).call({lesson_id:'lesson'})).status,404);
 assert.equal((await runtime('abba-lesson-content',{coursePublished:true,expires:'2000-01-01'}).call({lesson_id:'lesson'})).status,403);
 assert.equal((await runtime('abba-lesson-content',{coursePublished:true}).call({lesson_id:'lesson'})).status,200);
 r=runtime('abba-admin-registrations');response=await r.call({action:'review-admission',user_id:'11111111-1111-4111-8111-111111111111',decision:'approved'});assert.equal(response.status,200);assert.equal(r.state.writes[0].patch.app_metadata.academy_admission,'approved');assert.equal(r.state.writes.length,1);
 response=await r.call({id:'11111111-1111-4111-8111-111111111111',decision:'rejected',expected_status:'pending'});assert.equal(response.status,409);
 response=await r.call({id:'11111111-1111-4111-8111-111111111111',decision:'approved',percent:82,expected_status:'approved'});assert.equal(response.status,200);assert.equal(r.state.writes.at(-1).patch.approved_percent,82);
 console.log('17 backend checks passed: CORS, authentication, authorization, input validation, conflict detection, course closure, expiration, admission and scholarship review.');
})().catch(e=>{console.error(e);process.exitCode=1});
