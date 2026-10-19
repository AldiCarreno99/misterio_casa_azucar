const STORAGE_KEY = 'misterio-casa-azucar-v1';
const starterChallenges = [
  {id:'inicio-1', number:1, topic:'Nos adentramos en el misterio', question:'Antes de leer: ¿qué te sugiere el título «La casa de azúcar»?', options:['Una casa dulce, delicada o frágil','Un lugar que podría esconder algo extraño','Una historia realista de la vida cotidiana','Todavía no tengo una idea'], explanation:'No hay una única respuesta correcta: son hipótesis iniciales. Después de leer, podrán compararlas con lo que ocurre en el cuento.', foundation:'Contá qué palabra del título te llevó a esa idea.', open:true, fixed:true},
  {id:'inicio-2', number:2, topic:'Nos adentramos en el misterio', question:'Después de la lectura, ¿qué situación te dejó más preguntas?', options:['Una situación difícil de explicar','Una conducta de un personaje','Un detalle que parecía importante','Necesito volver a leer un fragmento'], explanation:'Compartir dudas es parte del análisis. No es necesario llegar enseguida a una explicación única.', foundation:'Anotá o mencioná el fragmento que te generó esa duda.', open:true, fixed:true},
  {id:'inicio-3', number:3, topic:'Buscamos las pistas del misterio', question:'¿Qué hace que una pista sea útil para interpretar un cuento?', options:['Se puede relacionar con un fragmento del texto','Confirma cualquier idea aunque el texto no la apoye','Es siempre un objeto mágico','Evita que existan interpretaciones diferentes'], explanation:'Una interpretación sólida se apoya en indicios del relato. La pista puede admitir más de una lectura, pero hay que explicar cómo se relaciona con el texto.', foundation:'Elegí una pista del cuento y explicá qué te permite pensar.', correct:0, fixed:true}
];
let challenges = [];
let selectedAnswers = {};
let toastTimer;
const $ = (sel, root=document) => root.querySelector(sel);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function loadData(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...starterChallenges, blankChallenge(4)];
    const parsed = JSON.parse(raw);
    const saved = Array.isArray(parsed.challenges) ? parsed.challenges : [];
    const merged = starterChallenges.map(base => saved.find(item => item.id === base.id) || base);
    const custom = saved.filter(item => !starterChallenges.some(base => base.id === item.id)).sort((a,b)=>a.number-b.number);
    const all = [...merged, ...custom];
    if (!all.some(item => item.number >= 4 && !String(item.question||'').trim())) all.push(blankChallenge(nextNumber(all)));
    return all;
  } catch { return [...starterChallenges, blankChallenge(4)]; }
}
function blankChallenge(number){return {id:`custom-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,number,topic:'Pregunta surgida del debate',question:'',options:['','','',''],explanation:'',foundation:'',open:true,correct:-1,fixed:false};}
function nextNumber(items=challenges){return Math.max(3,...items.map(item=>Number(item.number)||0))+1;}
function saveData(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({version:1,challenges})); $('#saveStatus').innerHTML='<span class="status-dot"></span> Guardado en este dispositivo'; }
  catch { $('#saveStatus').innerHTML='<span class="status-dot" style="background:#b33"></span> No se pudo guardar'; showToast('El navegador no permitió guardar. Exportá una copia de seguridad.'); }
}
function showToast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2300);}
function challengeReady(item){return String(item.question||'').trim().length>0;}
function renderPlay(){
  const host=$('#challengeList');host.innerHTML='';
  const playable=challenges.filter(item=>item.number<=3||challengeReady(item));
  const blanks=challenges.filter(item=>item.number>=4&&!challengeReady(item));
  $('#challengeCount').textContent=`${playable.length} ${playable.length===1?'desafío':'desafíos'}`;
  playable.sort((a,b)=>a.number-b.number).forEach(item=>{
    const card=document.createElement('article');card.className='challenge-card';
    const opts=(item.options||[]).filter(Boolean);
    card.innerHTML=`<div class="challenge-top"><span class="number">${item.number}</span><span class="topic">${escapeHtml(item.topic||'Desafío')}</span></div><h3>${escapeHtml(item.question)}</h3><div class="options">${opts.map((opt,i)=>`<button class="option ${selectedAnswers[item.id]===i?'selected':''}" data-answer="${i}" data-id="${escapeHtml(item.id)}"><span class="letter">${String.fromCharCode(65+i)}.</span><span>${escapeHtml(opt)}</span></button>`).join('')}</div>${selectedAnswers[item.id]!==undefined?`<div class="feedback"><strong>${item.correct===undefined||item.correct===-1?'Para conversar':selectedAnswers[item.id]===item.correct?'Respuesta elegida':'Revisemos la respuesta'}</strong>${escapeHtml(item.explanation||'No hay una única respuesta: expliquen qué fragmento del cuento sostiene la interpretación.')}</div>`:''}${item.foundation?`<p class="foundation"><strong>Para fundamentar:</strong> ${escapeHtml(item.foundation)}</p>`:''}`;
    host.appendChild(card);
  });
  if(blanks.length){const card=document.createElement('div');card.className='empty-card';card.innerHTML=`<strong>El debate todavía está escribiendo el desafío ${Math.min(...blanks.map(x=>x.number))}.</strong><p>Este espacio está en blanco a propósito. Agreguen la pregunta desde la sección «Preguntas» cuando surja en clase.</p><button class="small-button" id="goEdit">Crear pregunta</button>`;host.appendChild(card);$('#goEdit').addEventListener('click',()=>setView('edit'));}
  if(!blanks.length){const card=document.createElement('div');card.className='empty-card';card.innerHTML='<strong>¿Surgió una nueva pregunta?</strong><p>Agreguen el próximo desafío durante el debate y quedará guardado.</p><button class="small-button" id="goEdit">Agregar pregunta</button>';host.appendChild(card);$('#goEdit').addEventListener('click',()=>setView('edit'));}
  host.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>{selectedAnswers[btn.dataset.id]=Number(btn.dataset.answer);renderPlay();}));
}
function renderEditor(){
  const host=$('#editorList');host.innerHTML='';
  challenges.filter(item=>item.number>=4).sort((a,b)=>a.number-b.number).forEach(item=>{
    const card=document.createElement('article');card.className='editor-card';
    card.innerHTML=`<div class="editor-title"><h3>Desafío ${item.number}</h3>${challengeReady(item)?'<span class="count-pill">En borrador</span>':'<span class="count-pill">En blanco</span>'}</div>
      <div class="field"><label for="q-${item.id}">Pregunta o consigna</label><textarea id="q-${item.id}" data-field="question" data-id="${escapeHtml(item.id)}" placeholder="Escriban aquí la pregunta que surgió del debate…">${escapeHtml(item.question)}</textarea></div>
      <div class="field"><label for="topic-${item.id}">Tema (opcional)</label><input id="topic-${item.id}" data-field="topic" data-id="${escapeHtml(item.id)}" value="${escapeHtml(item.topic)}" placeholder="Ej.: una pista, una duda, una interpretación"></div>
      <div class="field"><label>Opciones (opcional, si quieren jugar con alternativas)</label><div class="option-fields">${[0,1,2,3].map(i=>`<div class="option-row"><input aria-label="Opción ${i+1} del desafío ${item.number}" data-option="${i}" data-id="${escapeHtml(item.id)}" value="${escapeHtml((item.options||[])[i]||'')}" placeholder="Opción ${i+1} (opcional)"></div>`).join('')}</div></div>
      <div class="field"><label for="foundation-${item.id}">¿Qué deben justificar con el cuento? (opcional)</label><textarea id="foundation-${item.id}" data-field="foundation" data-id="${escapeHtml(item.id)}" placeholder="Ej.: ¿Qué fragmento apoya esta interpretación?">${escapeHtml(item.foundation||'')}</textarea></div>
      <div class="field"><label for="explain-${item.id}">Notas para el debate (opcional)</label><textarea id="explain-${item.id}" data-field="explanation" data-id="${escapeHtml(item.id)}" placeholder="Una aclaración para conversar después de responder">${escapeHtml(item.explanation||'')}</textarea></div>
      <div class="actions"><button class="secondary-button" data-save="${escapeHtml(item.id)}">Guardar desafío</button><button class="danger-button" data-delete="${escapeHtml(item.id)}" aria-label="Eliminar desafío ${item.number}">Eliminar</button></div>`;
    host.appendChild(card);
  });
  host.querySelectorAll('[data-field]').forEach(input=>input.addEventListener('input',()=>{const item=challenges.find(x=>x.id===input.dataset.id);if(item){item[input.dataset.field]=input.value;saveData();renderPlay();}}));
  host.querySelectorAll('[data-option]').forEach(input=>input.addEventListener('input',()=>{const item=challenges.find(x=>x.id===input.dataset.id);if(item){if(!Array.isArray(item.options))item.options=['','','',''];item.options[Number(input.dataset.option)]=input.value;saveData();}}));
  host.querySelectorAll('[data-save]').forEach(btn=>btn.addEventListener('click',()=>{const item=challenges.find(x=>x.id===btn.dataset.save);if(item){saveData();renderEditor();renderPlay();showToast(challengeReady(item)?`Desafío ${item.number} guardado`:'Desafío guardado en blanco para completar después');}}));
  host.querySelectorAll('[data-delete]').forEach(btn=>btn.addEventListener('click',()=>{const item=challenges.find(x=>x.id===btn.dataset.delete);if(!item)return;if(!confirm(`¿Eliminar el desafío ${item.number}?`))return;challenges=challenges.filter(x=>x.id!==item.id);challenges.filter(x=>x.number>=4).sort((a,b)=>a.number-b.number).forEach((x,i)=>x.number=i+4);if(!challenges.some(x=>x.number>=4&&!challengeReady(x)))challenges.push(blankChallenge(nextNumber()));saveData();renderEditor();renderPlay();showToast('Desafío eliminado');}));
}
function setView(view){document.querySelectorAll('.tab').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===view));$('#playView').classList.toggle('hidden',view!=='play');$('#editView').classList.toggle('hidden',view!=='edit');if(view==='edit')renderEditor();else renderPlay();window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.view)));
$('#addChallenge').addEventListener('click',()=>{const blanks=challenges.filter(item=>item.number>=4&&!challengeReady(item));if(blanks.length){showToast('Completá primero el desafío en blanco que ya está preparado.');const first=$(`#q-${blanks[0].id}`);if(first)first.focus();return;}challenges.push(blankChallenge(nextNumber()));saveData();renderEditor();renderPlay();showToast('Nuevo desafío en blanco agregado');setTimeout(()=>{const last=$('#editorList .editor-card:last-child textarea');last?.focus();},60);});
$('#exportQuestions').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({title:'El misterio de la casa de azúcar',exportedAt:new Date().toISOString(),challenges},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='preguntas_misterio_casa_de_azucar.json';a.click();URL.revokeObjectURL(url);showToast('Copia de seguridad exportada');});
$('#importQuestions').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());const imported=Array.isArray(data)?data:data.challenges;if(!Array.isArray(imported))throw new Error('Formato');if(!confirm('Importar reemplazará las preguntas guardadas en este dispositivo. ¿Continuar?'))return;const custom=imported.filter(x=>Number(x.number)>=4).map((x,i)=>({...x,id:`custom-import-${Date.now()}-${i}`,number:i+4,options:Array.isArray(x.options)?x.options:['','','','']}));challenges=[...starterChallenges,...custom];if(!challenges.some(x=>x.number>=4&&!challengeReady(x)))challenges.push(blankChallenge(nextNumber()));saveData();renderEditor();renderPlay();showToast('Preguntas importadas');}catch{showToast('No se pudo leer ese archivo JSON.');}finally{event.target.value='';}});
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
