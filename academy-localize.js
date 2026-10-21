(()=>{
'use strict';
// A single persistent language preference for the ABBA Academy UI.
const dictionaries={
 en:{'settingsProgress .settings-kicker':'MY LEARNING JOURNEY','settingsLessons .settings-kicker':'LESSONS','settingsNotes .settings-kicker':'MY NOTES','settingsLessons .settings-section-line strong':'Lesson library','settingsLessons .section-copy':'Published lessons are available. Others remain locked.','settingsNotes .settings-section-line strong':'Notes by lesson','settingsNotes .section-copy':'Your notes appear with the correct lesson.','captionLanguageBar label':'Subtitles','academyInterfaceLanguage #preferredLanguageLabel':'Academy language','academyInterfaceLanguage #languageHelp':'Your selected language is saved for your next visit.'},
 es:{'settingsProgress .settings-kicker':'MI PROGRESO','settingsLessons .settings-kicker':'CLASES','settingsNotes .settings-kicker':'MIS NOTAS','settingsLessons .settings-section-line strong':'Biblioteca de clases','settingsLessons .section-copy':'Las clases publicadas están disponibles. Las demás permanecen bloqueadas.','settingsNotes .settings-section-line strong':'Notas por clase','settingsNotes .section-copy':'Tus notas aparecen en la clase correspondiente.','captionLanguageBar label':'Subtítulos','academyInterfaceLanguage #preferredLanguageLabel':'Idioma de la academia','academyInterfaceLanguage #languageHelp':'Tu idioma se guardará para tu próxima visita.'},
 pt:{'settingsProgress .settings-kicker':'MINHA JORNADA','settingsLessons .settings-kicker':'AULAS','settingsNotes .settings-kicker':'MINHAS NOTAS','settingsLessons .settings-section-line strong':'Biblioteca de aulas','settingsLessons .section-copy':'As aulas publicadas ficam disponíveis. As demais permanecem bloqueadas.','settingsNotes .settings-section-line strong':'Notas por aula','settingsNotes .section-copy':'Suas anotações aparecem na aula correta.','captionLanguageBar label':'Legendas','academyInterfaceLanguage #preferredLanguageLabel':'Idioma da academia','academyInterfaceLanguage #languageHelp':'Seu idioma escolhido será salvo para a próxima visita.'}
};
const sel=document.getElementById('languageSelect'), caption=document.getElementById('captionLanguageSelect');
function lang(){return ['en','pt','es','hi','te','de-CH','ne'].includes(document.documentElement.lang)?document.documentElement.lang:'pt'}
function apply(){const l=lang();for(const [key,value] of Object.entries(dictionaries[l]||dictionaries.en)){const ix=key.indexOf(' ');const target=document.querySelector('#'+key.slice(0,ix)+' '+key.slice(ix+1));if(target&&target.textContent!==value)target.textContent=value;}if(sel&&sel.value!==l)sel.value=l;}
function syncCaption(l){if(!caption)return;const target=l==='en'?'en':'pt';if(caption.value!==target){caption.value=target;caption.dispatchEvent(new Event('change',{bubbles:true}));}}
sel?.addEventListener('change',()=>{const l=sel.value;localStorage.setItem('abba_lang',l);syncCaption(l);queueMicrotask(apply)});
new MutationObserver(apply).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
apply();syncCaption(lang());
})();
