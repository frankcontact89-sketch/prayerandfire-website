(() => {
  const langSelect = document.getElementById("langSelect");
  if(!langSelect) return;

  const T = {
    es: {
      "Global Movement":"Movimiento Global",
      "Home":"Inicio",
      "Gallery":"Galería",
      "P&F Store":"Tienda P&F",
      "Support":"Apoyar",
      "Contact":"Contacto",
      "One Movement. Many Nations.":"Un Movimiento. Muchas Naciones.",
      "More than 45 countries represented and more than 65 churches connected through faith, missions, unity, prayer and global impact.":"Más de 45 países representados y más de 65 iglesias conectadas por medio de la fe, las misiones, la unidad, la oración y el impacto global.",
      "Countries Represented":"Países Representados",
      "Churches Connected":"Iglesias Conectadas",
      "Prayer Vision":"Visión de Oración",
      "Global Impact":"Impacto Global",
      "Transforming lives through prayer and action":"Transformando vidas mediante la oración y la acción",
      "Prayer & Fire impacts communities through faith initiatives, education, food programs, social support and projects that strengthen people and new generations across Africa, Asia, Europe and North America.":"Prayer & Fire impacta comunidades mediante iniciativas de fe, educación, programas de alimentación, apoyo social y proyectos que fortalecen a las personas y a las nuevas generaciones en África, Asia, Europa y Norteamérica.",
      "Who we are":"Quiénes somos",
      "Prayer & Fire was founded on September 13, 2024 as a global Christian movement devoted to prayer, faith, unity, missions and service across nations.":"Prayer & Fire fue fundado el 13 de septiembre de 2024 como un movimiento cristiano global dedicado a la oración, la fe, la unidad, las misiones y el servicio entre las naciones.",
      "What we are":"Lo que somos",
      "A global Christian movement impacting nations and new generations through prayer, unity, faith and collaboration across cultures and countries.":"Un movimiento cristiano global que impacta naciones y nuevas generaciones mediante la oración, la unidad, la fe y la colaboración entre culturas y países.",
      "What we do":"Lo que hacemos",
      "Prayer gatherings and intercession":"Reuniones de oración e intercesión",
      "Global ministry connection":"Conexión ministerial global",
      "Missions and community outreach":"Misiones y alcance comunitario",
      "Educational and food support initiatives":"Iniciativas educativas y de apoyo alimentario",
      "Faith-based resources and service":"Recursos basados en la fe y servicio",
      "Founders":"Fundadores",
      "Founder":"Fundadora",
      "President":"Presidente",
      "Founder of Prayer & Fire, serving the global vision of prayer, unity, faith and impact among nations.":"Fundadora de Prayer & Fire, sirviendo a la visión global de oración, unidad, fe e impacto entre las naciones.",
      "President of Prayer & Fire, serving the movement through leadership, prayer and global mission.":"Presidente de Prayer & Fire, sirviendo al movimiento mediante liderazgo, oración y misión global.",
      "Real photos and videos from Prayer & Fire missions, meetings, prayer gatherings, education, outreach and service across nations.":"Fotos y videos reales de las misiones, reuniones, encuentros de oración, educación, alcance y servicio de Prayer & Fire entre las naciones.",
      "Photos":"Fotos",
      "Videos":"Videos",
      "Official Prayer & Fire resources, books, apparel and products.":"Recursos oficiales de Prayer & Fire, libros, ropa y productos.",
      "Books on Amazon":"Libros en Amazon",
      "Browse available Prayer & Fire books and open them securely on Amazon.":"Explora los libros disponibles de Prayer & Fire y ábrelos de forma segura en Amazon.",
      "View Books":"Ver Libros",
      "Apparel & Products":"Ropa y Productos",
      "Shop official Prayer & Fire products through our Etsy store.":"Compra productos oficiales de Prayer & Fire en nuestra tienda de Etsy.",
      "Open Etsy Store":"Abrir Tienda Etsy",
      "Prayer & Fire Store":"Tienda Prayer & Fire",
      "Books":"Libros",
      "Browse available titles and open each book securely on Amazon.":"Explora los títulos disponibles y abre cada libro de forma segura en Amazon.",
      "← Back to Store":"← Volver a la Tienda",
      "Support the Mission":"Apoya la Misión",
      "Fuel the global prayer movement.":"Impulsa el movimiento global de oración.",
      "Your generosity helps support prayer initiatives, global outreach, faith resources and the Prayer & Fire mission.":"Tu generosidad ayuda a sostener iniciativas de oración, alcance global, recursos de fe y la misión de Prayer & Fire.",
      "One-time giving":"Donación única",
      "Give securely via Stripe.":"Dona de forma segura mediante Stripe.",
      "Give once":"Donar una vez",
      "Monthly support ($8.99)":"Apoyo mensual ($8.99)",
      "Become a monthly supporter of the global prayer vision.":"Conviértete en colaborador mensual de la visión global de oración.",
      "Start monthly support":"Iniciar apoyo mensual",
      "Manage subscription":"Administrar suscripción",
      "Update your payment method or cancel monthly support securely.":"Actualiza tu método de pago o cancela el apoyo mensual de forma segura.",
      "Connect with Prayer & Fire":"Conéctate con Prayer & Fire",
      "Use our official email and social platforms for ministry communication, partnership questions and support.":"Usa nuestro correo oficial y nuestras plataformas sociales para comunicación ministerial, preguntas de colaboración y apoyo.",
      "Official Email":"Correo Oficial",
      "Send a direct message to the Prayer & Fire team.":"Envía un mensaje directo al equipo de Prayer & Fire.",
      "Subscribe for Updates":"Suscríbete a las Novedades",
      "Receive Prayer & Fire ministry updates, mission news, global impact reports and new products.":"Recibe novedades del ministerio Prayer & Fire, noticias de misiones, informes de impacto global y nuevos productos.",
      "Subscribe":"Suscribirse",
      "Follow the official Prayer & Fire account.":"Sigue la cuenta oficial de Prayer & Fire.",
      "A global movement impacting nations and new generations through prayer, unity, missions and faith in Christ.":"Un movimiento global que impacta naciones y nuevas generaciones mediante la oración, la unidad, las misiones y la fe en Cristo.",
      "Navigation":"Navegación",
      "Resources":"Recursos",
      "Privacy Policy":"Política de Privacidad",
      "Terms":"Términos",
      "Global prayer, missions and Christian outreach.":"Oración global, misiones y alcance cristiano.",
      "All rights reserved.":"Todos los derechos reservados.",
      "Shop Now":"Comprar Ahora",
      "Loading books...":"Cargando libros...",
      "Books are not available right now.":"Los libros no están disponibles en este momento.",
      "No books have been published yet.":"Aún no se han publicado libros.",
      "No cover":"Sin portada",
      "View on Amazon":"Ver en Amazon",
      "Amazon link coming soon":"Enlace de Amazon próximamente",
      "We are having trouble loading books right now.":"Estamos teniendo problemas para cargar los libros en este momento.",
      "No videos have been published yet.":"Aún no se han publicado videos.",
      "No photos have been published yet.":"Aún no se han publicado fotos.",
      "Gallery media will appear here.":"El contenido de la galería aparecerá aquí.",
      "Play video":"Reproducir video",
      "Loading gallery...":"Cargando galería...",
      "We are having trouble loading the gallery right now.":"Estamos teniendo problemas para cargar la galería en este momento.",
      "Global impact updates will appear here.":"Las novedades de impacto global aparecerán aquí.",
      "Saving...":"Guardando...",
      "Please try again later.":"Por favor, inténtalo de nuevo más tarde.",
      "Subscription failed.":"La suscripción falló.",
      "You are already subscribed. Your information is up to date.":"Ya estás suscrito. Tu información está actualizada.",
      "Thank you. You are subscribed.":"Gracias. Ya estás suscrito.",
      "Unable to subscribe right now.":"No es posible suscribirse en este momento."
    },
    pt: {
      "Global Movement":"Movimento Global",
      "Home":"Início",
      "Gallery":"Galeria",
      "P&F Store":"Loja P&F",
      "Support":"Apoiar",
      "Contact":"Contato",
      "One Movement. Many Nations.":"Um Movimento. Muitas Nações.",
      "More than 45 countries represented and more than 65 churches connected through faith, missions, unity, prayer and global impact.":"Mais de 45 países representados e mais de 65 igrejas conectadas por meio da fé, missões, unidade, oração e impacto global.",
      "Countries Represented":"Países Representados",
      "Churches Connected":"Igrejas Conectadas",
      "Prayer Vision":"Visão de Oração",
      "Global Impact":"Impacto Global",
      "Transforming lives through prayer and action":"Transformando vidas por meio da oração e da ação",
      "Prayer & Fire impacts communities through faith initiatives, education, food programs, social support and projects that strengthen people and new generations across Africa, Asia, Europe and North America.":"Prayer & Fire impacta comunidades por meio de iniciativas de fé, educação, programas de alimentação, apoio social e projetos que fortalecem pessoas e novas gerações na África, Ásia, Europa e América do Norte.",
      "Who we are":"Quem somos",
      "Prayer & Fire was founded on September 13, 2024 as a global Christian movement devoted to prayer, faith, unity, missions and service across nations.":"Prayer & Fire foi fundado em 13 de setembro de 2024 como um movimento cristão global dedicado à oração, fé, unidade, missões e serviço entre as nações.",
      "What we are":"O que somos",
      "A global Christian movement impacting nations and new generations through prayer, unity, faith and collaboration across cultures and countries.":"Um movimento cristão global que impacta nações e novas gerações por meio da oração, unidade, fé e colaboração entre culturas e países.",
      "What we do":"O que fazemos",
      "Prayer gatherings and intercession":"Encontros de oração e intercessão",
      "Global ministry connection":"Conexão ministerial global",
      "Missions and community outreach":"Missões e alcance comunitário",
      "Educational and food support initiatives":"Iniciativas educacionais e de apoio alimentar",
      "Faith-based resources and service":"Recursos baseados na fé e serviço",
      "Founders":"Fundadores",
      "Founder":"Fundadora",
      "President":"Presidente",
      "Founder of Prayer & Fire, serving the global vision of prayer, unity, faith and impact among nations.":"Fundadora do Prayer & Fire, servindo à visão global de oração, unidade, fé e impacto entre as nações.",
      "President of Prayer & Fire, serving the movement through leadership, prayer and global mission.":"Presidente do Prayer & Fire, servindo ao movimento por meio de liderança, oração e missão global.",
      "Real photos and videos from Prayer & Fire missions, meetings, prayer gatherings, education, outreach and service across nations.":"Fotos e vídeos reais das missões, reuniões, encontros de oração, educação, alcance e serviço do Prayer & Fire entre as nações.",
      "Photos":"Fotos",
      "Videos":"Vídeos",
      "Official Prayer & Fire resources, books, apparel and products.":"Recursos oficiais do Prayer & Fire, livros, roupas e produtos.",
      "Books on Amazon":"Livros na Amazon",
      "Browse available Prayer & Fire books and open them securely on Amazon.":"Veja os livros disponíveis do Prayer & Fire e abra-os com segurança na Amazon.",
      "View Books":"Ver Livros",
      "Apparel & Products":"Roupas e Produtos",
      "Shop official Prayer & Fire products through our Etsy store.":"Compre produtos oficiais do Prayer & Fire em nossa loja Etsy.",
      "Open Etsy Store":"Abrir Loja Etsy",
      "Prayer & Fire Store":"Loja Prayer & Fire",
      "Books":"Livros",
      "Browse available titles and open each book securely on Amazon.":"Veja os títulos disponíveis e abra cada livro com segurança na Amazon.",
      "← Back to Store":"← Voltar à Loja",
      "Support the Mission":"Apoie a Missão",
      "Fuel the global prayer movement.":"Impulsione o movimento global de oração.",
      "Your generosity helps support prayer initiatives, global outreach, faith resources and the Prayer & Fire mission.":"Sua generosidade ajuda a sustentar iniciativas de oração, alcance global, recursos de fé e a missão do Prayer & Fire.",
      "One-time giving":"Doação única",
      "Give securely via Stripe.":"Doe com segurança pelo Stripe.",
      "Give once":"Doar uma vez",
      "Monthly support ($8.99)":"Apoio mensal ($8.99)",
      "Become a monthly supporter of the global prayer vision.":"Torne-se um apoiador mensal da visão global de oração.",
      "Start monthly support":"Iniciar apoio mensal",
      "Manage subscription":"Gerenciar assinatura",
      "Update your payment method or cancel monthly support securely.":"Atualize seu método de pagamento ou cancele o apoio mensal com segurança.",
      "Connect with Prayer & Fire":"Conecte-se com Prayer & Fire",
      "Use our official email and social platforms for ministry communication, partnership questions and support.":"Use nosso e-mail oficial e nossas plataformas sociais para comunicação ministerial, perguntas sobre parcerias e apoio.",
      "Official Email":"E-mail Oficial",
      "Send a direct message to the Prayer & Fire team.":"Envie uma mensagem direta para a equipe do Prayer & Fire.",
      "Subscribe for Updates":"Inscreva-se para Novidades",
      "Receive Prayer & Fire ministry updates, mission news, global impact reports and new products.":"Receba novidades do ministério Prayer & Fire, notícias de missões, relatórios de impacto global e novos produtos.",
      "Subscribe":"Inscrever-se",
      "Follow the official Prayer & Fire account.":"Siga a conta oficial do Prayer & Fire.",
      "A global movement impacting nations and new generations through prayer, unity, missions and faith in Christ.":"Um movimento global que impacta nações e novas gerações por meio da oração, unidade, missões e fé em Cristo.",
      "Navigation":"Navegação",
      "Resources":"Recursos",
      "Privacy Policy":"Política de Privacidade",
      "Terms":"Termos",
      "Global prayer, missions and Christian outreach.":"Oração global, missões e alcance cristão.",
      "All rights reserved.":"Todos os direitos reservados.",
      "Shop Now":"Comprar Agora",
      "Loading books...":"Carregando livros...",
      "Books are not available right now.":"Os livros não estão disponíveis neste momento.",
      "No books have been published yet.":"Nenhum livro foi publicado ainda.",
      "No cover":"Sem capa",
      "View on Amazon":"Ver na Amazon",
      "Amazon link coming soon":"Link da Amazon em breve",
      "We are having trouble loading books right now.":"Estamos com dificuldades para carregar os livros neste momento.",
      "No videos have been published yet.":"Nenhum vídeo foi publicado ainda.",
      "No photos have been published yet.":"Nenhuma foto foi publicada ainda.",
      "Gallery media will appear here.":"O conteúdo da galeria aparecerá aqui.",
      "Play video":"Reproduzir vídeo",
      "Loading gallery...":"Carregando galeria...",
      "We are having trouble loading the gallery right now.":"Estamos com dificuldades para carregar a galeria neste momento.",
      "Global impact updates will appear here.":"As novidades de impacto global aparecerão aqui.",
      "Saving...":"Salvando...",
      "Please try again later.":"Por favor, tente novamente mais tarde.",
      "Subscription failed.":"A inscrição falhou.",
      "You are already subscribed. Your information is up to date.":"Você já está inscrito. Suas informações estão atualizadas.",
      "Thank you. You are subscribed.":"Obrigado. Você está inscrito.",
      "Unable to subscribe right now.":"Não foi possível realizar a inscrição neste momento."
    }
  };

  const A = {
    es:{"Language":"Idioma","Open live meeting":"Abrir reunión en vivo","Filter gallery media":"Filtrar contenido de la galería","Name":"Nombre","Email":"Correo electrónico","Country":"País","Close image":"Cerrar imagen"},
    pt:{"Language":"Idioma","Open live meeting":"Abrir reunião ao vivo","Filter gallery media":"Filtrar conteúdo da galeria","Name":"Nome","Email":"E-mail","Country":"País","Close image":"Fechar imagem"}
  };

  const norm = v => String(v || "").replace(/\s+/g," ").trim();

  function englishKey(value,map){
    const n = norm(value);
    if(!n) return "";
    if(map.es[n] || map.pt[n]) return n;
    for(const lang of ["es","pt"]){
      for(const [en,tr] of Object.entries(map[lang])){
        if(norm(tr) === n) return en;
      }
    }
    return n;
  }

  function translateTextNode(node,lang){
    if(!node || node.nodeType !== Node.TEXT_NODE) return;
    const parent = node.parentElement;
    if(!parent || parent.closest("script,style,noscript")) return;
    const current = norm(node.nodeValue);
    if(!current) return;
    const en = englishKey(current,T);
    const tr = lang === "en" ? en : (T[lang]?.[en] || en);
    if(tr !== current){
      const leading = (node.nodeValue.match(/^\s*/) || [""])[0];
      const trailing = (node.nodeValue.match(/\s*$/) || [""])[0];
      node.nodeValue = leading + tr + trailing;
    }
  }

  function translateAttributes(root,lang){
    const els = [];
    if(root?.nodeType === Node.ELEMENT_NODE) els.push(root);
    if(root?.querySelectorAll) els.push(...root.querySelectorAll("[placeholder],[aria-label],[title]"));
    els.forEach(el => {
      ["placeholder","aria-label","title"].forEach(attr => {
        if(!el.hasAttribute?.(attr)) return;
        const current = el.getAttribute(attr);
        const en = englishKey(current,A);
        const tr = lang === "en" ? en : (A[lang]?.[en] || en);
        if(tr && tr !== current) el.setAttribute(attr,tr);
      });
    });
  }

  function translateSubtree(root,lang){
    if(!root) return;
    if(root.nodeType === Node.TEXT_NODE){ translateTextNode(root,lang); return; }
    if(root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    const walker = document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while((node = walker.nextNode())) translateTextNode(node,lang);
    translateAttributes(root,lang);
  }

  function applyLanguage(lang){
    const finalLang = ["en","es","pt"].includes(lang) ? lang : "en";
    document.documentElement.lang = finalLang;
    document.documentElement.dataset.language = finalLang;
    translateSubtree(document.body,finalLang);
    if(langSelect.value !== finalLang) langSelect.value = finalLang;
    try{ localStorage.setItem("pf_lang",finalLang); }catch(e){}
  }

  let busy = false;
  const observer = new MutationObserver(mutations => {
    if(busy) return;
    const lang = document.documentElement.dataset.language || langSelect.value || "en";
    if(lang === "en") return;
    busy = true;
    try{
      mutations.forEach(m => {
        if(m.type === "characterData") translateTextNode(m.target,lang);
        m.addedNodes?.forEach(node => translateSubtree(node,lang));
      });
    }finally{ busy = false; }
  });

  observer.observe(document.body,{childList:true,subtree:true,characterData:true});

  const initial = ["en","es","pt"].includes(langSelect.value) ? langSelect.value : "en";
  applyLanguage(initial);
  langSelect.addEventListener("change",e => applyLanguage(e.target.value));
})();
