(() => {
  const select = document.getElementById('langSelect');
  const hero = document.querySelector('.hero h1');
  if(!select || !hero) return;
  const text = {
    en:['One Movement.','Many Nations.'],
    es:['Un Movimiento.','Muchas Naciones.'],
    pt:['Um Movimento.','Muitas Nações.']
  };
  function apply(){
    const lang = ['en','es','pt'].includes(select.value) ? select.value : 'en';
    const nodes = [...hero.childNodes].filter(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim());
    if(nodes[0]) nodes[0].nodeValue = '\n        ' + text[lang][0];
    if(nodes[1]) nodes[1].nodeValue = '\n        ' + text[lang][1] + '\n      ';
  }
  select.addEventListener('change', () => setTimeout(apply,0));
  apply();
})();
