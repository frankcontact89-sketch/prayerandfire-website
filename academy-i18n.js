(()=>{
'use strict';
// Academy UI translations are handled by academy.js (pt/en/es).
// Keep the selector available; never force Portuguese or overwrite caption preferences.
const sel=document.getElementById('languageSelect');
const labels={pt:['IDIOMA','Idioma da academia','Selecione o idioma da interface. As legendas são configuradas separadamente.'],en:['LANGUAGE','Academy language','Select the academy interface language. Video subtitles are configured separately.'],es:['IDIOMA','Idioma de la academia','Seleccione el idioma de la interfaz. Los subtítulos se configuran por separado.']};
function update(){const lang=['pt','en','es'].includes(document.documentElement.lang)?document.documentElement.lang:'pt';const a=labels[lang];for(const [id,text] of [['languageLabel',a[0]],['preferredLanguageLabel',a[1]],['languageHelp',a[2]]]){const node=document.getElementById(id);if(node)node.textContent=text;}}
sel?.addEventListener('change',()=>setTimeout(update,80));
update();
})();
