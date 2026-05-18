/* ===== MELEGIM — app.js ===== */

/* --- AUTH --- */
/* Auth géré par le Worker Cloudflare */
let currentUser = '';

async function doLogin() {
  const u = document.getElementById('login-user').value.trim().toLowerCase();
  const p = document.getElementById('login-pass').value;
  const btn = document.querySelector('.login-btn');
  btn.textContent = 'Vérification...';
  btn.disabled = true;
  try {
    const resp = await fetch('https://winter-sun-345c.peniel-mizhari.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', user: u, pass: p })
    });
    const data = await resp.json();
    if (data.ok) {
      currentUser = u;
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app-screen').style.display = 'block';
      document.getElementById('user-badge').textContent = u.charAt(0).toUpperCase() + u.slice(1);
      initApp();
    } else {
      document.getElementById('login-err').style.display = 'block';
    }
  } catch(e) {
    document.getElementById('login-err').textContent = 'Erreur de connexion. Vérifie ta connexion internet.';
    document.getElementById('login-err').style.display = 'block';
  }
  btn.textContent = 'Entrer dans mon espace';
  btn.disabled = false;
}

function doLogout() {
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-pass').value = '';
  document.getElementById('login-err').style.display = 'none';
  currentUser = '';
}

/* --- CONTENU SPIRITUEL & MOTIVATION --- */
const VERSETS = [
  { ref: 'Jérémie 29:11', v: 'Car je connais les projets que j\'ai formés sur vous, projets de paix et non de malheur, afin de vous donner un avenir et de l\'espérance.' },
  { ref: 'Philippiens 4:13', v: 'Je puis tout par celui qui me fortifie.' },
  { ref: 'Proverbes 31:25', v: 'Elle est revêtue de force et de magnificence, et elle rit à l\'avenir.' },
  { ref: 'Ésaïe 41:10', v: 'Ne crains rien, car je suis avec toi. Je suis ton Dieu, je te fortifie et je t\'aide.' },
  { ref: 'Psaume 37:4', v: 'Fais de l\'Éternel tes délices, et il te donnera ce que ton cœur désire.' },
  { ref: 'Romains 8:28', v: 'Toutes choses concourent au bien de ceux qui aiment Dieu.' },
  { ref: 'Josué 1:9', v: 'Sois forte et courageuse. Ne t\'effraie pas, car l\'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.' },
  { ref: 'Psaume 23:1', v: 'L\'Éternel est mon berger : je ne manquerai de rien.' },
  { ref: 'Ésaïe 40:31', v: 'Ceux qui se confient en l\'Éternel renouvellent leur force. Ils prennent le vol comme les aigles.' },
  { ref: '1 Corinthiens 10:13', v: 'Dieu est fidèle, et il ne permettra pas que vous soyez tentés au-delà de vos forces.' },
  { ref: 'Matthieu 6:33', v: 'Cherchez premièrement le royaume et la justice de Dieu ; et toutes ces choses vous seront données par-dessus.' },
  { ref: 'Proverbes 16:3', v: 'Recommande à l\'Éternel tes œuvres, et tes projets réussiront.' },
  { ref: 'Lamentations 3:23', v: 'Les bontés de l\'Éternel sont nouvelles chaque matin. Sa fidélité est grande.' },
  { ref: 'Galates 6:9', v: 'Ne nous lassons pas de faire le bien ; car nous moissonnerons au temps convenable, si nous ne nous relâchons pas.' }
];

const MOTIVATIONS = [
  'Ta marque existe déjà dans les plans de Dieu. Chaque couture est un pas vers ton rêve. Tu es plus proche que tu ne le penses. 💗',
  'Les grandes maisons de mode ont toutes commencé par une idée folle et des mains courageuses. Tu as les deux. Avance !',
  'Ta créativité est un don unique que Dieu t\'a confié. Même les jours difficiles construisent ta fondation. Tu es forte.',
  'Chaque esquisse que tu poses raconte ton histoire. Le monde attend ta vision. Ne t\'arrête jamais.',
  'La persévérance est le tissu de tous les grands rêves. Tu couds le tien, point par point. Continue !',
  'Ta sensibilité n\'est pas une faiblesse, c\'est ta signature créative. Embrasse-la et crée de la magie.',
  'Aujourd\'hui, fais juste une petite chose pour ta marque. Un seul pas suffit. L\'élan viendra.',
  'Tu n\'es pas seule dans cette aventure. Dieu marche avec toi, et les gens qui t\'aiment croient en toi. 🌸',
  'Chaque jour sans créer n\'est pas un jour perdu — c\'est un jour de repos que tu mérites. Sois douce avec toi-même.',
  'Ton regard sur la mode est unique. Personne d\'autre ne voit les choses exactement comme toi. C\'est ta force.',
  'Les obstacles d\'aujourd\'hui sont les histoires inspirantes de demain. Tiens bon, créatrice !',
  'Chaque tissu que tu touches, chaque couleur que tu choisis est une prière créative. Dieu voit ton travail.',
  'Ta marque ne sera pas comme les autres parce que toi, tu n\'es pas comme les autres. Célèbre ça !',
  'Un rêve écrit devient un objectif. Un objectif planifié devient réalité. Écris, planifie, crée. Tu peux le faire !'
];

/* --- STATE --- */
let S = {
  todos: [],
  plan: [[], [], [], [], [], [], []],
  journal: [],
  mats: [],
  collections: [
    { id: 1, name: 'Collection été', emoji: '☀️' },
    { id: 2, name: 'Collection hiver', emoji: '❄️' },
    { id: 3, name: 'Intemporel', emoji: '✨' },
    { id: 4, name: 'Idées en vrac', emoji: '💡' }
  ],
  pieces: [],
  matNotes: [],
  ressources: []
};

function lsKey(k) { return 'melegim_' + currentUser + '_' + k; }

function loadState() {
  ['todos', 'plan', 'journal', 'mats', 'collections', 'pieces', 'matNotes', 'ressources'].forEach(k => {
    const v = localStorage.getItem(lsKey(k));
    if (v) { try { S[k] = JSON.parse(v); } catch (e) {} }
  });
}

function saveS(k) { localStorage.setItem(lsKey(k), JSON.stringify(S[k])); }

/* --- TOAST --- */
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

/* --- DATE & INIT --- */
const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTH_NAMES = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function initApp() {
  loadState();

  const now = new Date();
  const dayIdx = now.getDay();
  const todayStr = DAY_NAMES[dayIdx] + ' ' + now.getDate() + ' ' + MONTH_NAMES[now.getMonth()] + ' ' + now.getFullYear();
  document.getElementById('today-date').textContent = todayStr;

  const name = currentUser.charAt(0).toUpperCase() + currentUser.slice(1);
  document.getElementById('greet-txt').textContent = 'Bonjour ' + name + ' ✨';
  document.getElementById('greet-sub').textContent = 'Que ce ' + DAY_NAMES[dayIdx].toLowerCase() + ' soit riche en créativité et en foi. 🌸';

  const vIdx = (now.getDate() + now.getMonth()) % VERSETS.length;
  const verset = VERSETS[vIdx];
  document.getElementById('b-ref').textContent = verset.ref;
  document.getElementById('b-txt').textContent = verset.v;

  const mIdx = (now.getDate() + dayIdx) % MOTIVATIONS.length;
  document.getElementById('motiv-txt').textContent = MOTIVATIONS[mIdx];

  renderAll();
  setTimeout(() => { initCanvas(); resizeCanvas(); populateCollSelect(); }, 150);
}

/* --- NAVIGATION --- */
const PAGE_TITLES = {
  dashboard: 'melegim', todo: 'Mes tâches', planning: 'Planning',
  matieres: 'Matières', journal: 'Mon espace', croquis: 'Atelier croquis', collections: 'Mes collections', ressources: 'Mes ressources'
};
const PAGE_ORDER = ['dashboard', 'todo', 'planning', 'matieres', 'journal', 'croquis', 'collections', 'ressources'];

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.getElementById('page-title').textContent = PAGE_TITLES[id] || id;
  const idx = PAGE_ORDER.indexOf(id);
  if (idx >= 0) document.querySelectorAll('.nav-btn')[idx].classList.add('active');
  if (id === 'collections') renderCollections();
  if (id === 'ressources') renderRessources();
  if (id === 'croquis') { resizeCanvas(); renderMatTags(); populateCollSelect(); }
}

/* --- STATS --- */
function updateStats() {
  document.getElementById('s-tasks').textContent = S.todos.filter(t => !t.done).length;
  document.getElementById('s-colls').textContent = S.collections.length;
  const h = S.pieces.reduce((a, p) => a + (p.hours || 0), 0);
  document.getElementById('s-hours').textContent = h + 'h';
  document.getElementById('s-journal').textContent = S.journal.length;
}

function renderAll() {
  renderTodos();
  renderPlanning();
  renderMats();
  renderJournal();
  renderMatTags();
  renderRessources();
  updateStats();
}

/* ===== TODOS ===== */
function addTodo() {
  const v = document.getElementById('todo-inp').value.trim();
  if (!v) return;
  const p = document.getElementById('todo-prio').value;
  S.todos.unshift({ id: Date.now(), text: v, done: false, prio: p });
  saveS('todos');
  renderTodos();
  document.getElementById('todo-inp').value = '';
  toast('Tâche ajoutée 💗');
}

function renderTodos() {
  const el = document.getElementById('todo-list');
  if (!S.todos.length) {
    el.innerHTML = '<p style="color:var(--text-s);font-size:13px;text-align:center;margin-top:28px;font-style:italic">Aucune tâche pour l\'instant ✨</p>';
    updateStats(); return;
  }
  el.innerHTML = S.todos.map(t => `
    <div class="todo-item">
      <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTodo(${t.id})">
      <label class="${t.done ? 'done' : ''}" onclick="toggleTodo(${t.id})">${t.text}</label>
      <span class="prio-badge">${t.prio}</span>
      <button onclick="delTodo(${t.id})" style="background:none;border:none;cursor:pointer;color:var(--text-s);font-size:18px;display:flex;align-items:center">
        <i class="ti ti-x"></i>
      </button>
    </div>`).join('');
  updateStats();
}

function toggleTodo(id) {
  const t = S.todos.find(x => x.id === id);
  if (t) { t.done = !t.done; saveS('todos'); renderTodos(); }
}

function delTodo(id) {
  S.todos = S.todos.filter(x => x.id !== id);
  saveS('todos'); renderTodos();
}

/* ===== PLANNING ===== */
function renderPlanning() {
  document.getElementById('week-grid').innerHTML = WEEK_DAYS.map((d, i) => `
    <div class="day-col">
      <div class="day-name">${d}</div>
      ${(S.plan[i] || []).map((t, j) => `
        <div class="day-task" onclick="delPlan(${i},${j})" title="Cliquer pour supprimer">${t}</div>
      `).join('')}
    </div>`).join('');
}

function addPlanTask() {
  const t = document.getElementById('plan-task').value.trim();
  const d = parseInt(document.getElementById('plan-day').value);
  if (!t) return;
  if (!S.plan[d]) S.plan[d] = [];
  S.plan[d].push(t);
  saveS('plan'); renderPlanning();
  document.getElementById('plan-task').value = '';
  toast('Planifié pour ' + WEEK_DAYS[d] + ' 📅');
}

function delPlan(d, j) {
  S.plan[d].splice(j, 1);
  saveS('plan'); renderPlanning();
}

/* ===== MATIERES ===== */
function addMat() {
  S.mats.push({ id: Date.now(), name: '', qty: 1, prix: 0 });
  saveS('mats'); renderMats();
}

function renderMats() {
  const el = document.getElementById('mat-list');
  el.innerHTML = S.mats.map((m, i) => `
    <div class="mat-row">
      <input class="inp" type="text" value="${m.name}" placeholder="Ex: coton blanc..." style="font-size:12px;padding:8px 10px"
        oninput="S.mats[${i}].name=this.value;saveS('mats')">
      <input class="inp" type="number" min="0" step="0.1" value="${m.qty}" style="font-size:12px;padding:8px 10px"
        oninput="S.mats[${i}].qty=parseFloat(this.value)||0;calcMat()">
      <input class="inp" type="number" min="0" step="0.01" value="${m.prix}" style="font-size:12px;padding:8px 10px"
        oninput="S.mats[${i}].prix=parseFloat(this.value)||0;calcMat()">
      <button onclick="delMat(${i})" style="background:none;border:none;cursor:pointer;color:var(--text-s);font-size:20px;display:flex;align-items:center">
        <i class="ti ti-trash"></i>
      </button>
    </div>`).join('');
  calcMat();
}

function delMat(i) { S.mats.splice(i, 1); saveS('mats'); renderMats(); }

function calcMat() {
  const t = S.mats.reduce((a, m) => a + (m.qty * m.prix), 0);
  document.getElementById('mat-total').textContent = t.toFixed(2).replace('.', ',') + ' €';
}

/* ===== JOURNAL ===== */
function saveJournal() {
  const v = document.getElementById('journal-inp').value.trim();
  if (!v) return;
  S.journal.unshift({ id: Date.now(), text: v, date: new Date().toLocaleString('fr-FR') });
  saveS('journal'); renderJournal();
  document.getElementById('journal-inp').value = '';
  toast('Pensée gardée 💗'); updateStats();
}

function renderJournal() {
  const el = document.getElementById('journal-list');
  if (!S.journal.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<p style="font-size:12px;color:var(--text-s);margin-bottom:12px;font-style:italic">Tes pensées précédentes :</p>' +
    S.journal.map(e => `
      <div class="entry-card">
        <div class="entry-date"><i class="ti ti-clock" style="font-size:11px;vertical-align:-1px"></i> ${e.date}</div>
        <div class="entry-text">${e.text.replace(/\n/g, '<br>')}</div>
      </div>`).join('');
}

/* ===== BLOC-NOTES MATIÈRES CROQUIS ===== */
function addMatNote() {
  const v = document.getElementById('mat-note-inp').value.trim();
  if (!v) return;
  S.matNotes.push(v);
  saveS('matNotes'); renderMatTags();
  document.getElementById('mat-note-inp').value = '';
}

function delMatNote(i) { S.matNotes.splice(i, 1); saveS('matNotes'); renderMatTags(); }

function renderMatTags() {
  const el = document.getElementById('mat-tags');
  if (!el) return;
  el.innerHTML = S.matNotes.map((t, i) => `
    <span class="mat-tag">${t}
      <button onclick="delMatNote(${i})"><i class="ti ti-x" style="font-size:10px"></i></button>
    </span>`).join('');
}

/* ===== IA CROQUIS ===== */
async function askIA() {
  var q = document.getElementById('ia-inp').value.trim();
  if (!q) return;
  document.getElementById('ia-loading').style.display = 'block';
  document.getElementById('ia-resp').style.display = 'none';

  try {
    var systemPrompt = "Tu es experte en mode. Reponds UNIQUEMENT avec du JSON valide, aucun texte autour. Format exact : {\"prompt_en\":\"fashion design sketch, white background, professional fashion illustration, clean lines\",\"silhouette\":\"jupe\",\"details\":[\"volant\",\"poche\"],\"matieres\":[\"coton\"],\"conseil\":\"conseil court\",\"description\":\"description courte en francais\"}. Silhouette (un seul) : robe, bustier, top, veste, pantalon, jupe. Details (max 3) : boutons, tirets, col, poche, zip, volant, ceinture, noeud. Pour prompt_en, decris le vetement en anglais de facon detaillee pour une IA image.";

    var resp = await fetch('https://winter-sun-345c.peniel-mizhari.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: q }]
      })
    });

    var data = await resp.json();
    if (data.error) {
      document.getElementById('ia-resp').innerHTML = 'Erreur : ' + data.error.message;
      document.getElementById('ia-resp').style.display = 'block';
      document.getElementById('ia-loading').style.display = 'none';
      return;
    }

    var txt = data.content.filter(function(c) { return c.type === 'text'; }).map(function(c) { return c.text; }).join('').trim();
    var parsed;
    try {
      var jsonMatch = txt.match(/[\s\S]*/);
      var start = txt.indexOf('{');
      var end2 = txt.lastIndexOf('}');
      parsed = JSON.parse(txt.substring(start, end2 + 1));
    } catch(e) {
      document.getElementById('ia-resp').innerHTML = 'Erreur de format. Reessaie !';
      document.getElementById('ia-resp').style.display = 'block';
      document.getElementById('ia-loading').style.display = 'none';
      return;
    }

    var promptEn = parsed.prompt_en || 'fashion design sketch, elegant clothing, white background, professional fashion illustration';
    var imageUrl = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(promptEn) + '?width=512&height=768&nologo=true&seed=' + Date.now();

    document.getElementById('ia-resp').innerHTML = 'Generation de l image en cours... (15-30 secondes)';
    document.getElementById('ia-resp').style.display = 'block';
    document.getElementById('ia-loading').style.display = 'none';

    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      history = [];
      var scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      var x = (canvas.width - img.width * scale) / 2;
      var y = (canvas.height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      endDraw();

      if (parsed.matieres && parsed.matieres.length) {
        parsed.matieres.forEach(function(m) {
          if (!S.matNotes.includes(m)) S.matNotes.push(m);
        });
        saveS('matNotes');
        renderMatTags();
      }

      if (parsed.description) {
        var nameInput = document.getElementById('sketch-name');
        if (nameInput) nameInput.value = parsed.description.substring(0, 60);
      }

      var html = '<strong>Image generee !</strong><br><br>';
      if (parsed.description) html += parsed.description + '<br><br>';
      if (parsed.conseil) html += '<em>' + parsed.conseil + '</em><br><br>';
      html += '<small>Tu peux retoucher avec les outils puis sauver dans le portfolio !</small>';
      document.getElementById('ia-resp').innerHTML = html;
    };

    img.onerror = function() {
      document.getElementById('ia-resp').innerHTML = 'Generation echouee. Reessaie dans quelques secondes !';
    };

    img.src = imageUrl;

  } catch (e) {
    document.getElementById('ia-resp').innerHTML = 'Erreur : ' + e.message;
    document.getElementById('ia-resp').style.display = 'block';
    document.getElementById('ia-loading').style.display = 'none';
  }
}

/* ===== CANVAS ===== */
let canvas, ctx, drawing = false, tool = 'draw', penColor = '#3D2314';
let startX, startY, snapshot, history = [];

function initCanvas() {
  canvas = document.getElementById('sketch-canvas');
  ctx = canvas.getContext('2d');
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', moveDraw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect(), t = e.touches[0];
    startDraw({ offsetX: (t.clientX - r.left) * (canvas.width / r.width), offsetY: (t.clientY - r.top) * (canvas.height / r.height) });
  }, { passive: false });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect(), t = e.touches[0];
    moveDraw({ offsetX: (t.clientX - r.left) * (canvas.width / r.width), offsetY: (t.clientY - r.top) * (canvas.height / r.height) });
  }, { passive: false });
  canvas.addEventListener('touchend', endDraw);
}

function resizeCanvas() {
  if (!canvas) return;
  const w = canvas.parentElement.clientWidth;
  canvas.style.width = w + 'px';
  canvas.style.height = Math.round(w * 520 / 700) + 'px';
}

function startDraw(e) {
  drawing = true;
  startX = e.offsetX; startY = e.offsetY;
  if (tool === 'line' || tool === 'rect' || tool === 'dash') {
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } else {
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  }
}

function moveDraw(e) {
  if (!drawing) return;
  const sz = parseInt(document.getElementById('brush-sz').value) || 2;
  ctx.lineWidth = tool === 'erase' ? sz * 3 : sz;
  ctx.strokeStyle = tool === 'erase' ? '#ffffff' : penColor;

  if (tool === 'draw' || tool === 'erase') {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  } else if (tool === 'line') {
    ctx.putImageData(snapshot, 0, 0);
    ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke();
  } else if (tool === 'dash') {
    ctx.putImageData(snapshot, 0, 0);
    ctx.setLineDash([8, 5]);
    ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke();
    ctx.setLineDash([]);
  } else if (tool === 'rect') {
    ctx.putImageData(snapshot, 0, 0);
    ctx.strokeRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
  }
}

function endDraw() {
  if (drawing) {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (history.length > 30) history.shift();
  }
  drawing = false;
  ctx.setLineDash([]);
}

function setTool(t) {
  tool = t;
  document.querySelectorAll('.tool-btn[id^="tb-"]').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('tb-' + t);
  if (el) el.classList.add('active');
}

function setColor(c, el) {
  penColor = c;
  document.querySelectorAll('.color-swatch').forEach(d => d.classList.remove('sel'));
  el.classList.add('sel');
  setTool('draw');
}

function clearCanvas() {
  history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function undoSketch() {
  if (history.length) ctx.putImageData(history.pop(), 0, 0);
}

function dlSketch() {
  if (!canvas) return;
  const a = document.createElement('a');
  a.download = 'croquis-melegim.png';
  a.href = canvas.toDataURL();
  a.click();
}

/* ===== SILHOUETTES ===== */
function drawSil(type) {
  if (!canvas) return;
  const cx = canvas.width / 2;
  ctx.save();
  ctx.strokeStyle = penColor;
  ctx.lineWidth = parseInt(document.getElementById('brush-sz').value) || 2;
  ctx.lineCap = 'round';

  // Tête
  ctx.beginPath();
  ctx.ellipse(cx, 72, 22, 26, 0, 0, Math.PI * 2);
  ctx.stroke();

  if (type === 'robe') {
    ctx.beginPath(); ctx.moveTo(cx - 22, 98); ctx.lineTo(cx + 22, 98); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 22, 98); ctx.bezierCurveTo(cx - 45, 160, cx - 55, 240, cx - 80, 400); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 22, 98); ctx.bezierCurveTo(cx + 45, 160, cx + 55, 240, cx + 80, 400); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 80, 400); ctx.lineTo(cx + 80, 400); ctx.stroke();
  } else if (type === 'bustier') {
    ctx.beginPath(); ctx.moveTo(cx - 28, 98); ctx.quadraticCurveTo(cx, 72, cx + 28, 98); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 18, 98); ctx.lineTo(cx - 14, 55);
    ctx.moveTo(cx + 18, 98); ctx.lineTo(cx + 14, 55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 28, 98); ctx.lineTo(cx - 28, 250); ctx.lineTo(cx + 28, 250); ctx.lineTo(cx + 28, 98); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 28, 250); ctx.bezierCurveTo(cx - 55, 300, cx - 65, 360, ctx - 70, 430); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 28, 250); ctx.bezierCurveTo(cx - 55, 300, cx - 65, 360, cx - 70, 430); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 28, 250); ctx.bezierCurveTo(cx + 55, 300, cx + 65, 360, cx + 70, 430); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 70, 430); ctx.lineTo(cx + 70, 430); ctx.stroke();
  } else if (type === 'top') {
    ctx.beginPath();
    ctx.moveTo(cx - 22, 98); ctx.lineTo(cx - 52, 122); ctx.lineTo(cx - 48, 250);
    ctx.lineTo(cx + 48, 250); ctx.lineTo(cx + 52, 122); ctx.lineTo(cx + 22, 98);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 52, 122); ctx.lineTo(cx - 72, 190); ctx.lineTo(cx - 52, 240);
    ctx.moveTo(cx + 52, 122); ctx.lineTo(cx + 72, 190); ctx.lineTo(cx + 52, 240); ctx.stroke();
  } else if (type === 'veste') {
    ctx.beginPath();
    ctx.moveTo(cx - 22, 98); ctx.lineTo(cx - 58, 110); ctx.lineTo(cx - 62, 300);
    ctx.lineTo(cx - 20, 310); ctx.lineTo(cx - 12, 380);
    ctx.lineTo(cx + 12, 380); ctx.lineTo(cx + 20, 310);
    ctx.lineTo(cx + 62, 300); ctx.lineTo(cx + 58, 110); ctx.lineTo(cx + 22, 98); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 58, 110); ctx.lineTo(cx - 84, 230); ctx.lineTo(cx - 62, 300);
    ctx.moveTo(cx + 58, 110); ctx.lineTo(cx + 84, 230); ctx.lineTo(cx + 62, 300); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 8, 98); ctx.lineTo(cx - 10, 380);
    ctx.moveTo(cx + 8, 98); ctx.lineTo(cx + 10, 380); ctx.stroke();
  } else if (type === 'pantalon') {
    ctx.beginPath();
    ctx.moveTo(cx - 40, 80); ctx.lineTo(cx - 44, 230); ctx.lineTo(cx - 20, 460);
    ctx.moveTo(cx - 20, 460); ctx.lineTo(cx, 260); ctx.lineTo(cx + 20, 460);
    ctx.moveTo(cx + 20, 460); ctx.lineTo(cx + 44, 230); ctx.lineTo(cx + 40, 80);
    ctx.lineTo(cx - 40, 80); ctx.stroke();
  } else if (type === 'jupe') {
    ctx.beginPath(); ctx.moveTo(cx - 22, 98); ctx.lineTo(cx + 22, 98); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 22, 98); ctx.bezierCurveTo(cx - 65, 200, cx - 90, 320, cx - 100, 450); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 22, 98); ctx.bezierCurveTo(cx + 65, 200, cx + 90, 320, cx + 100, 450); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 100, 450); ctx.lineTo(cx + 100, 450); ctx.stroke();
  }

  ctx.restore();
  endDraw();
}

/* ===== DÉTAILS ===== */
function addDetail(type) {
  if (!canvas) return;
  const cx = canvas.width / 2;
  ctx.save();
  ctx.strokeStyle = penColor;
  ctx.lineWidth = parseInt(document.getElementById('brush-sz').value) || 2;
  ctx.lineCap = 'round';

  if (type === 'boutons') {
    for (let i = 0; i < 7; i++) {
      ctx.beginPath(); ctx.arc(cx, 150 + i * 30, 5, 0, Math.PI * 2); ctx.stroke();
    }
  } else if (type === 'tirets') {
    ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(cx - 70, 200); ctx.lineTo(cx + 70, 200); ctx.stroke();
    ctx.setLineDash([]);
  } else if (type === 'col') {
    ctx.beginPath();
    ctx.moveTo(cx - 26, 98); ctx.quadraticCurveTo(cx, 140, cx + 26, 98); ctx.stroke();
  } else if (type === 'poche') {
    ctx.strokeRect(cx - 50, 230, 42, 48);
  } else if (type === 'zip') {
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(cx, 98); ctx.lineTo(cx, 280); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(cx, 190, 7, 0, Math.PI * 2); ctx.stroke();
  } else if (type === 'volant') {
    ctx.beginPath();
    for (let x = cx - 80; x <= cx + 80; x += 4) {
      const y = 310 + Math.sin((x - cx) / 9) * 14;
      if (x === cx - 80) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  } else if (type === 'ceinture') {
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx - 55, 210); ctx.lineTo(cx + 55, 210); ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.rect(cx - 8, 203, 16, 14); ctx.stroke();
  } else if (type === 'noeud') {
    ctx.beginPath();
    ctx.moveTo(cx, 150); ctx.bezierCurveTo(cx - 30, 130, cx - 45, 160, cx, 160);
    ctx.bezierCurveTo(cx + 45, 160, cx + 30, 130, cx, 150); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 160); ctx.lineTo(cx - 20, 200);
    ctx.moveTo(cx, 160); ctx.lineTo(cx + 20, 200); ctx.stroke();
  }

  ctx.restore();
  endDraw();
}

/* ===== SAUVEGARDER CROQUIS ===== */
function saveSketch() {
  if (!canvas) return;
  const name = document.getElementById('sketch-name').value.trim() || 'Croquis du ' + new Date().toLocaleDateString('fr-FR');
  const collId = parseInt(document.getElementById('sketch-coll').value) || null;
  const notes = document.getElementById('mat-note-area').value;
  S.pieces.push({
    id: Date.now(),
    name,
    collId,
    img: canvas.toDataURL(),
    hours: 0,
    date: new Date().toLocaleDateString('fr-FR'),
    matNotes: notes,
    matTags: [...S.matNotes]
  });
  saveS('pieces');
  updateStats();
  toast('Croquis "' + name + '" sauvegardé 🎨');
}

/* ===== COLLECTIONS ===== */
function populateCollSelect() {
  const sel = document.getElementById('sketch-coll');
  if (!sel) return;
  sel.innerHTML = '<option value="">Choisir une collection...</option>' +
    S.collections.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');
}

let activeCollId = 'all';

function newCollection() {
  const name = prompt('Nom de la nouvelle collection ?');
  if (!name || !name.trim()) return;
  const emojis = ['🌸', '💫', '🌙', '🌺', '✨', '🎀', '🌿', '💎', '🕊️', '🌼'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  S.collections.push({ id: Date.now(), name: name.trim(), emoji });
  saveS('collections');
  renderCollections();
  populateCollSelect();
  updateStats();
  toast('Collection "' + name.trim() + '" créée ✨');
}

function filterColl(id) { activeCollId = id; renderCollections(); }

function renderCollections() {
  const tabsEl = document.getElementById('coll-tabs');
  tabsEl.innerHTML =
    `<button class="coll-tab ${activeCollId === 'all' ? 'active' : ''}" onclick="filterColl('all')">Tout voir</button>` +
    S.collections.map(c =>
      `<button class="coll-tab ${activeCollId == c.id ? 'active' : ''}" onclick="filterColl(${c.id})">${c.emoji} ${c.name}</button>`
    ).join('');

  const pieces = activeCollId === 'all' ? S.pieces : S.pieces.filter(p => p.collId == activeCollId);
  const grid = document.getElementById('coll-grid');

  let html = pieces.map(p => {
    const coll = S.collections.find(c => c.id == p.collId);
    return `
      <div class="coll-card">
        <div class="coll-thumb">
          ${p.img ? `<img src="${p.img}" alt="${p.name}">` : '<span style="font-size:40px">✨</span>'}
        </div>
        <div class="coll-info">
          <div class="coll-name">${p.name}</div>
          <div class="coll-meta">${p.date}${coll ? ' · ' + coll.emoji + ' ' + coll.name : ''}</div>
          ${p.matTags && p.matTags.length ? '<div style="margin:4px 0">' + p.matTags.map(t => `<span class="mat-tag">${t}</span>`).join('') + '</div>' : ''}
          ${p.matNotes ? `<div style="font-size:11px;color:var(--text-s);margin-top:4px;font-style:italic">${p.matNotes.substring(0, 60)}${p.matNotes.length > 60 ? '...' : ''}</div>` : ''}
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
            <span class="hours-badge">
              <i class="ti ti-clock" style="font-size:10px"></i>
              <input type="number" min="0" value="${p.hours || 0}"
                style="width:36px;border:none;background:transparent;font-size:11px;color:var(--cara-d);font-weight:700"
                onchange="updHours(${p.id},this.value)"> h
            </span>
            <button onclick="delPiece(${p.id})"
              style="background:none;border:none;cursor:pointer;color:var(--text-s);font-size:16px;display:flex;align-items:center">
              <i class="ti ti-trash"></i>
            </button>
          </div>
        </div>
      </div>`;
  }).join('');

  html += `<div class="new-card-btn" onclick="showPage('croquis')">
    <i class="ti ti-plus"></i> Nouveau croquis
  </div>
  <label class="new-card-btn" style="cursor:pointer">
    <i class="ti ti-upload"></i> Uploader une image
    <input type="file" accept="image/*" style="display:none" onchange="uploadToCollection(this)">
  </label>`;
  grid.innerHTML = html;
}

function updHours(id, h) {
  const p = S.pieces.find(x => x.id === id);
  if (p) { p.hours = parseInt(h) || 0; saveS('pieces'); updateStats(); }
}

function delPiece(id) {
  if (!confirm('Supprimer ce croquis du portfolio ?')) return;
  S.pieces = S.pieces.filter(x => x.id !== id);
  saveS('pieces'); renderCollections(); updateStats();
}

/* ===== RESIZE ===== */

/* ===== UPLOAD IMAGE COLLECTION ===== */
function uploadToCollection(input) {
  const file = input.files[0];
  if (!file) return;
  const name = prompt('Nom de ce projet ?') || file.name.replace(/\.[^.]+$/, '');
  const reader = new FileReader();
  reader.onload = function(e) {
    const collId = activeCollId !== 'all' ? parseInt(activeCollId) : null;
    S.pieces.push({
      id: Date.now(),
      name: name,
      collId: collId,
      img: e.target.result,
      hours: 0,
      date: new Date().toLocaleDateString('fr-FR'),
      matNotes: '',
      matTags: [],
      uploaded: true
    });
    saveS('pieces');
    renderCollections();
    updateStats();
    toast('Image "' + name + '" ajoutée ! 🖼️');
  };
  reader.readAsDataURL(file);
}

/* ===== RESSOURCES ===== */
function addResource() {
  const url = document.getElementById('res-url').value.trim();
  const titre = document.getElementById('res-titre').value.trim();
  const cat = document.getElementById('res-cat').value;
  if (!url) return;
  const label = titre || url;
  S.ressources = S.ressources || [];
  S.ressources.unshift({ id: Date.now(), url, titre: label, cat, date: new Date().toLocaleDateString('fr-FR') });
  saveS('ressources');
  renderRessources();
  document.getElementById('res-url').value = '';
  document.getElementById('res-titre').value = '';
  toast('Ressource sauvegardée 🔗');
}

function delResource(id) {
  S.ressources = (S.ressources || []).filter(r => r.id !== id);
  saveS('ressources');
  renderRessources();
}

function renderRessources() {
  S.ressources = S.ressources || [];
  const el = document.getElementById('res-list');
  if (!el) return;
  const cats = ['tiktok', 'youtube', 'pinterest', 'article', 'autre'];
  const icons = { tiktok: 'ti-brand-tiktok', youtube: 'ti-brand-youtube', pinterest: 'ti-brand-pinterest', article: 'ti-file-text', autre: 'ti-link' };
  const labels = { tiktok: 'TikTok', youtube: 'YouTube', pinterest: 'Pinterest', article: 'Article', autre: 'Autre' };

  // Grouper par catégorie
  let html = '';
  cats.forEach(cat => {
    const items = S.ressources.filter(r => r.cat === cat);
    if (!items.length) return;
    html += '<div class="res-group">';
    html += '<div class="res-group-title"><i class="ti ' + icons[cat] + '"></i> ' + labels[cat] + ' (' + items.length + ')</div>';
    items.forEach(r => {
      html += '<div class="res-card">';
      html += '<a href="' + r.url + '" target="_blank" class="res-link"><i class="ti ti-external-link"></i> ' + r.titre + '</a>';
      html += '<div class="res-meta">' + r.date + '</div>';
      html += '<button onclick="delResource(' + r.id + ')" class="res-del"><i class="ti ti-trash"></i></button>';
      html += '</div>';
    });
    html += '</div>';
  });

  if (!S.ressources.length) {
    html = '<p style="color:var(--text-s);font-size:13px;text-align:center;margin-top:24px;font-style:italic">Aucune ressource pour l\'instant 🔗</p>';
  }
  el.innerHTML = html;
}

window.addEventListener('resize', () => { if (canvas) resizeCanvas(); });