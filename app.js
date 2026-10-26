const STORAGE_KEY = 'misterio-casa-azucar-v1';
const starterChallenges = [
  {id:'inicio-1', number:1, topic:'Nos adentramos en el misterio', question:'Antes de leer: ¿qué te sugiere el título «La casa de azúcar»?', options:['Una casa dulce, delicada o frágil','Un lugar que podría esconder algo extraño','Una historia realista de la vida cotidiana','Todavía no tengo una idea'], explanation:'No hay una única respuesta correcta: son hipótesis iniciales. Después de leer, podrán compararlas con lo que ocurre en el cuento.', foundation:'Contá qué palabra del título te llevó a esa idea.', open:true, fixed:true},
  {id:'inicio-2', number:2, topic:'Nos adentramos en el misterio', question:'Después de la lectura, ¿qué situación te dejó más preguntas?', options:['Una situación difícil de explicar','Una conducta de un personaje','Un detalle que parecía importante','Necesito volver a leer un fragmento'], explanation:'Compartir dudas es parte del análisis. No es necesario llegar enseguida a una explicación única.', foundation:'Anotá o mencioná el fragmento que te generó esa duda.', open:true, fixed:true},
  {id:'inicio-3', number:3, topic:'Buscamos las pistas del misterio', question:'¿Qué hace que una pista sea útil para interpretar un cuento?', options:['Se puede relacionar con un fragmento del texto','Confirma cualquier idea aunque el texto no la apoye','Es siempre un objeto mágico','Evita que existan interpretaciones diferentes'], explanation:'Una interpretación sólida se apoya en indicios del relato. La pista puede admitir más de una lectura, pero hay que explicar cómo se relaciona con el texto.', foundation:'Elegí una pista del cuento y explicá qué te permite pensar.', correct:0, fixed:true},
  {id:'inicio-4', number:4, topic:'Los cambios de Cristina', question:'¿Qué cambio comienza a notar el esposo en Cristina?', options:['Cristina comienza a comportarse de una manera diferente, cada vez más parecida a Violeta.','Cristina olvida por completo dónde vive.','Cristina deja de reconocer a todas las personas de su familia.'], explanation:'La conducta de Cristina empieza a parecerse a la de Violeta, lo que aumenta la incertidumbre sobre su identidad y transformación.', foundation:'Señalá un detalle del cuento que muestre ese cambio.', correct:0, fixed:true},
  {id:'inicio-5', number:5, topic:'La incertidumbre fantástica', question:'¿Por qué el lector duda sobre lo que realmente sucede con Cristina?', options:['Porque el narrador explica con certeza todos los acontecimientos.','Porque Cristina cuenta toda la historia desde su propia perspectiva.','Porque los hechos admiten distintas interpretaciones y no se resuelven de manera definitiva.'], explanation:'El relato mantiene la incertidumbre y permite distintas interpretaciones, sin confirmar una explicación definitiva.', foundation:'¿Qué hecho del cuento podría interpretarse de más de una manera?', correct:2, fixed:true},
  {id:'inicio-6', number:6, topic:'La voz narrativa', question:'¿Quién cuenta la historia?', options:['El esposo de Cristina, que relata los acontecimientos desde su perspectiva.','Violeta, que cuenta su vida desde el pasado.','Un narrador que conoce directamente los pensamientos de todos los personajes.'], explanation:'La historia está narrada por el esposo de Cristina, desde su propia perspectiva; por eso conocemos los hechos a través de su mirada.', foundation:'¿Cómo influye la perspectiva del narrador en lo que sabemos?', correct:0, fixed:true},
  {id:'inicio-7', number:7, topic:'El final abierto', question:'¿Cuál es una posible interpretación del final del cuento?', options:['El narrador descubre una explicación definitiva y demuestra que todo era una broma.','La desaparición de Cristina deja sin resolver completamente el misterio de su transformación.','Cristina regresa a su vida anterior y todo vuelve a ser como antes.'], explanation:'El final no resuelve por completo el misterio de la transformación de Cristina, por lo que la incertidumbre permanece.', foundation:'Justificá tu interpretación con un detalle del desenlace.', correct:1, fixed:true}
];
let challenges = [];
let selectedAnswers = {};
let toastTimer;
const $ = (sel, root=document) => root.querySelector(sel);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function loadData(){
  // Las siete preguntas base se actualizan con esta versión; se descartan los antiguos espacios en blanco.
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...starterChallenges];
    const parsed = JSON.parse(raw);
    const saved = Array.isArray(parsed.challenges) ? parsed.challenges : [];
    return starterChallenges.map(base => {
      const previous = saved.find(item => item.id === base.id);
      return previous ? {...base} : base;
    });
  } catch { return [...starterChallenges]; }
}
function saveData(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({version:1,challenges})); $('#saveStatus').innerHTML='<span class="status-dot"></span> Guardado en este dispositivo'; }
  catch { $('#saveStatus').innerHTML='<span class="status-dot" style="background:#b33"></span> No se pudo guardar'; showToast('El navegador no permitió guardar. Exportá una copia de seguridad.'); }
}
function showToast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2300);}
function challengeReady(item){return String(item.question||'').trim().length>0;}
function renderPlay(){
  const host=$('#challengeList');host.innerHTML='';
  const playable=challenges.slice().sort((a,b)=>a.number-b.number);
  $('#challengeCount').textContent=`${playable.length} desafíos`;
  playable.forEach(item=>{
    const card=document.createElement('article');card.className='challenge-card';
    const opts=(item.options||[]).filter(Boolean);
    card.innerHTML=`<div class="challenge-top"><span class="number">${item.number}</span><span class="topic">${escapeHtml(item.topic||'Desafío')}</span></div><h3>${escapeHtml(item.question)}</h3><div class="options">${opts.map((opt,i)=>`<button class="option ${selectedAnswers[item.id]===i?'selected':''}" data-answer="${i}" data-id="${escapeHtml(item.id)}"><span class="letter">${String.fromCharCode(65+i)}.</span><span>${escapeHtml(opt)}</span></button>`).join('')}</div>${item.number===7&&item.foundation?`<p class="foundation"><strong>Para fundamentar:</strong> ${escapeHtml(item.foundation)}</p>`:''}`;
    host.appendChild(card);
  });
  host.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>{selectedAnswers[btn.dataset.id]=Number(btn.dataset.answer);renderPlay();}));
}
function setView(view){document.querySelectorAll('.tab[data-view]').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===view));$('#playView').classList.remove('hidden');renderPlay();window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.view)));
challenges=loadData();saveData();renderPlay();
if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(()=>{});

// Instalación PWA: aparece solo en navegadores que ofrecen el diálogo de instalación.
let deferredInstallPrompt = null;
const installButton = document.querySelector('#installApp');
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton?.classList.remove('hidden');
});
installButton?.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.classList.add('hidden');
});
window.addEventListener('appinstalled', () => {
  installButton?.classList.add('hidden');
  showToast('Aplicación instalada en este dispositivo');
});
