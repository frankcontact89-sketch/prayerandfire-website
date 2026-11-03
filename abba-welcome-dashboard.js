(()=>{
'use strict';
const $=id=>document.getElementById(id);
const translations={
en:{emailPending:'Confirm your email',emailVerified:'Email confirmed',personalWelcome:'Welcome, {name}',welcome:'Welcome to ABBA Academy',subtitle:'Your place for deeper biblical learning and ministerial equipping.',status:'Student status',registered:'Pre-registered',account:'Account created',startLabel:'Classes expected to begin',date:'February 2027',notice:'Your account is ready. Course access will open when the program launches.',program:'Advanced Theology and Ministerial Leadership Training',lessons:'40 lessons',annual:'Annual program',language:'Preferred language saved',enrollment:'Registration status',access:'Course access',locked:'Locked until launch',details:'View program details',scholarship:'Apply for scholarship',settings:'Account settings',updates:'Updates',next:'What happens next?',step1:'Confirm your email using the link we sent.',step2:'Watch your inbox for official enrollment instructions.',step3:'Course lessons will open when the program launches.',learnTitle:'Your learning journey',learnText:'Your place in the course is not yet active. Lessons, assessments and the AI Coach remain unavailable during pre-registration.',exploreTitle:'Your program',exploreText:'Pre-registration is free. Tuition and enrollment payments have not opened yet.',back:'Back to overview',verifiedNote:'If you have already confirmed your email, no further action is needed for that step.',unverified:'Pending course activation',active:'Account ready',note:'No payment is collected during pre-registration.'},
pt:{emailPending:'Confirme seu e-mail',emailVerified:'E-mail confirmado',personalWelcome:'Bem-vindo(a), {name}',welcome:'Bem-vindo(a) à ABBA Academy',subtitle:'Um lugar para aprofundar o conhecimento bíblico e a formação ministerial.',status:'Situação do aluno',registered:'Pré-inscrito(a)',account:'Conta criada',startLabel:'Previsão de início das aulas',date:'Fevereiro de 2027',notice:'Sua conta está pronta. O acesso às aulas será liberado quando o programa começar.',program:'Formação de Liderança Ministerial em Teologia Aprofundada',lessons:'40 aulas',annual:'Programa anual',language:'Preferência de idioma salva',enrollment:'Situação da inscrição',access:'Acesso às aulas',locked:'Bloqueado até o lançamento',details:'Ver detalhes do programa',scholarship:'Solicitar bolsa de estudos',settings:'Configurações da conta',updates:'Novidades',next:'Quais são os próximos passos?',step1:'Confirme seu e-mail pelo link que enviamos.',step2:'Acompanhe sua caixa de entrada para receber instruções oficiais.',step3:'As aulas serão liberadas quando o programa começar.',learnTitle:'Sua jornada de aprendizado',learnText:'Sua vaga nas aulas ainda não está ativa. Aulas, avaliações e o Coach de IA continuam indisponíveis durante a pré-inscrição.',exploreTitle:'Seu programa',exploreText:'A pré-inscrição é gratuita. A matrícula e os pagamentos ainda não foram abertos.',back:'Voltar ao início',verifiedNote:'Se você já confirmou seu e-mail, essa etapa está concluída.',unverified:'Aguardando abertura do curso',active:'Conta pronta',note:'Nenhum pagamento é cobrado na pré-inscrição.'},
es:{emailPending:'Confirma tu correo',emailVerified:'Correo confirmado',personalWelcome:'Bienvenido, {name}',welcome:'Bienvenido a ABBA Academy',subtitle:'Tu espacio para profundizar en la Biblia y crecer en la formación ministerial.',status:'Estado del estudiante',registered:'Preinscrito',account:'Cuenta creada',startLabel:'Inicio previsto de las clases',date:'Febrero de 2027',notice:'Tu cuenta está lista. El acceso a las clases se abrirá cuando comience el programa.',program:'Formación de Liderazgo Ministerial en Teología Profunda',lessons:'40 clases',annual:'Programa anual',language:'Preferencia de idioma guardada',enrollment:'Estado de inscripción',access:'Acceso al curso',locked:'Bloqueado hasta el lanzamiento',details:'Ver detalles del programa',scholarship:'Solicitar una beca',settings:'Configuración de la cuenta',updates:'Novedades',next:'¿Cuáles son los próximos pasos?',step1:'Confirma tu correo con el enlace que enviamos.',step2:'Revisa tu bandeja de entrada para recibir instrucciones oficiales.',step3:'Las clases estarán disponibles cuando comience el programa.',learnTitle:'Tu recorrido de aprendizaje',learnText:'Tu acceso a las clases aún no está activo. Los videos, evaluaciones y el Coach de IA permanecen cerrados durante la preinscripción.',exploreTitle:'Tu programa',exploreText:'La preinscripción es gratuita. La matrícula y los pagos todavía no están habilitados.',back:'Volver al inicio',verifiedNote:'Si ya confirmaste tu correo, ese paso está completado.',unverified:'Pendiente de apertura del curso',active:'Cuenta lista',note:'No se cobra ningún pago durante la preinscripción.'}
};
let active=false,tab='home',viewer=null,lang='en';
const localized=(key)=>(translations[lang]||translations.en)[key]||key;
function install(){
 if($('abbaWelcome'))return;
 const host=$('portalView'),dashboard=$('dashboardView');
 if(!host||!dashboard)return;
 const section=document.createElement('section');section.id='abbaWelcome';section.className='abba-welcome hidden';
 section.innerHTML=`<div class="aw-heading"><div class="aw-emblem" aria-hidden="true">✦ <span>ABBA ACADEMY</span> ✦</div><h1 id="awTitle"></h1><p id="awSubtitle"></p><div class="aw-heading-rule"></div></div>
 <div id="awHome">
 <div class="aw-summary"><div class="aw-summary-item"><div class="aw-icon" aria-hidden="true">♙</div><div><span id="awStatusLabel"></span><strong id="awStatus" class="aw-pill"></strong></div></div><div class="aw-summary-item"><div class="aw-icon" aria-hidden="true">▦</div><div><span id="awStartLabel"></span><strong id="awStart"></strong></div></div></div>
 <div class="aw-notice"><span class="aw-notice-icon" aria-hidden="true">ⓘ</span><strong id="awNotice"></strong></div>
 <article class="aw-program"><div class="aw-program-main"><div class="aw-art aw-art-logo"><img class="aw-official-logo" src="abba-academy-official-logo.svg?v=20261103sharp1200" alt="ABBA Academy — official navy and gold logo" loading="eager" decoding="async"></div><div class="aw-program-meta"><span class="aw-overline">ABBA ACADEMY · 2027</span><h2 id="awProgram"></h2><div class="aw-bullet"><span aria-hidden="true">▷</span><span id="awLessons"></span></div><div class="aw-bullet"><span aria-hidden="true">▦</span><span id="awAnnual"></span></div><div class="aw-bullet"><span aria-hidden="true">◎</span><span id="awLanguage"></span></div></div></div><div class="aw-program-bottom"><div><span id="awEnrollmentLabel"></span><strong id="awEnrollment" class="aw-pill"></strong></div><div><span id="awAccessLabel"></span><strong id="awAccess" class="aw-pill aw-pill-muted"></strong></div></div></article>
 <div class="aw-actions"><button type="button" class="aw-action aw-action-primary" id="awDetails"><span aria-hidden="true">▤</span><strong id="awDetailsLabel"></strong><span aria-hidden="true">›</span></button><a class="aw-action" id="awScholarship" href="/academy-scholarship.html"><span aria-hidden="true">♧</span><strong id="awScholarshipLabel"></strong><span aria-hidden="true">›</span></a><button type="button" class="aw-action" id="awSettings"><span aria-hidden="true">⚙</span><strong id="awSettingsLabel"></strong><span aria-hidden="true">›</span></button><button type="button" class="aw-action" id="awUpdates"><span aria-hidden="true">◉</span><strong id="awUpdatesLabel"></strong><span aria-hidden="true">›</span></button></div>
 <div class="aw-next" id="awNext"><h2 id="awNextTitle"></h2><ol><li id="awStep1"></li><li id="awStep2"></li><li id="awStep3"></li></ol><p id="awNextNote"></p></div>
 </div><div class="aw-secondary hidden" id="awSecondary"><button type="button" id="awBack" class="aw-return"></button><h2 id="awSecondaryTitle"></h2><p id="awSecondaryText"></p><div class="aw-secondary-detail"><h3 id="awSecondaryProgram"></h3><p id="awSecondaryInfo"></p><p id="awSecondaryAccess"></p></div></div>`;
 host.insertBefore(section,dashboard);
 $('awDetails').addEventListener('click',()=>navigate('explore'));
 $('awScholarship').addEventListener('click',()=>{});
 $('awSettings').addEventListener('click',()=>navigate('profile'));
 $('awUpdates').addEventListener('click',()=>{navigate('home');$('awNext')?.scrollIntoView({behavior:'smooth',block:'start'})});
 $('awBack').addEventListener('click',()=>navigate('home'));
}
function render(user,language){
 viewer=user||viewer;lang=translations[language]?language:'en';install();
 if(!$('abbaWelcome'))return;
 const values={awTitle:'welcome',awSubtitle:'subtitle',awStatusLabel:'status',awStartLabel:'startLabel',awStart:'date',awNotice:'notice',awProgram:'program',awLessons:'lessons',awAnnual:'annual',awLanguage:'language',awEnrollmentLabel:'enrollment',awAccessLabel:'access',awAccess:'locked',awDetailsLabel:'details',awScholarshipLabel:'scholarship',awSettingsLabel:'settings',awUpdatesLabel:'updates',awNextTitle:'next',awStep1:'step1',awStep2:'step2',awStep3:'step3',awNextNote:'verifiedNote',awBack:'back',awSecondaryProgram:'program',awSecondaryAccess:'locked'};
 Object.entries(values).forEach(([id,key])=>{const el=$(id);if(el)el.textContent=localized(key)});
 const pre=viewer?.user_metadata?.academy_pre_registration===true;
 const verified=Boolean(viewer?.email_confirmed_at||viewer?.confirmed_at);
 const firstName=String(viewer?.user_metadata?.full_name||'').trim().split(/\s+/)[0].slice(0,45);
 if(firstName)$('awTitle').textContent=localized('personalWelcome').replace('{name}',firstName);
 $('awStatus').textContent=localized(verified?'emailVerified':'emailPending');
 $('awEnrollment').textContent=localized(pre?'registered':'account');
 $('awStep1').textContent=verified?localized('emailVerified'):localized('step1');

 $('awSecondaryTitle').textContent=localized(tab==='learn'?'learnTitle':'exploreTitle');
 $('awSecondaryText').textContent=localized(tab==='learn'?'learnText':'exploreText');
 $('awSecondaryInfo').textContent=localized('note');
 $('awAccess').textContent=localized('locked');
}
function navigate(next='home'){
 if(!active)return;
 if(next==='profile'){$('settingsBtn')?.click();return}
 tab=next==='learn'||next==='explore'?next:'home';
 render(viewer,lang);
 $('awHome').classList.toggle('hidden',tab!=='home');$('awSecondary').classList.toggle('hidden',tab==='home');
 document.querySelectorAll('[data-academy-tab]').forEach(b=>{if(b.dataset.academyTab===tab)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 window.scrollTo({top:0,behavior:'smooth'});
}
function show(user,language){
 active=true;viewer=user;lang=language;install();render(viewer,lang);
 $('abbaWelcome').classList.remove('hidden');
 $('dashboardView')?.classList.add('hidden');
 $('lessonView')?.classList.add('hidden');
 $('academyExplore')?.classList.add('hidden');
 $('academyBottomNav')?.classList.remove('hidden');
 $('noEnrollment')?.classList.add('hidden');
 navigate('home');
}
function hide(){active=false;$('abbaWelcome')?.classList.add('hidden')}
window.abbaWelcomeDashboard={show,hide,render,navigate,get active(){return active}};
})();
