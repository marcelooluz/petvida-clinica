'use strict';
const KEY = 'petvida-v1';
const SERVICES = {
  consulta: { n: 'Consulta', m: 30, t: 'vet' },
  vacina: { n: 'Vacinação', m: 30, t: 'vet' },
  banho: { n: 'Banho', m: 60, t: 'tosa' },
  tosa: { n: 'Banho e tosa', m: 90, t: 'tosa' }
};
const PROS = [
  { id: 'p1', n: 'Dr. Gabriel Santos', t: 'vet' },
  { id: 'p2', n: 'Dra. Camila Paes', t: 'vet' },
  { id: 'p3', n: 'Tosador 1', t: 'tosa' },
  { id: 'p4', n: 'Tosador 2', t: 'tosa' },
  { id: 'p5', n: 'Tosador 3', t: 'tosa' }
];
const OPEN = 8 * 60, CLOSE = 18 * 60, STEP = 30;

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const today = () => iso(new Date());
const addDays = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };
const fmt = d => d.split('-').reverse().join('/');
const toMin = h => +h.slice(0, 2) * 60 + +h.slice(3, 5);
const hm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const byDT = (a, b) => (a.data + a.hora).localeCompare(b.data + b.hora);

function seed() {
  const t = today();
  return {
    tutors: [
      { id: 't1', n: 'Ana Souza', tel: '5541999990001' },
      { id: 't2', n: 'Carlos Lima', tel: '5541999990002' }
    ],
    pets: [
      { id: 'a1', n: 'Thor', esp: 'Cão', raca: 'Golden Retriever', tutor: 't1',
        notes: [{ d: addDays(t, -40), txt: 'Consulta de rotina. Peso 31 kg, sem alterações.' }],
        vac: [{ n: 'V10', d: addDays(t, -350), prox: addDays(t, 15) }, { n: 'Antirrábica', d: addDays(t, -380), prox: addDays(t, -15) }] },
      { id: 'a2', n: 'Mia', esp: 'Gato', raca: 'SRD', tutor: 't2', notes: [],
        vac: [{ n: 'V4', d: addDays(t, -200), prox: addDays(t, 165) }] },
      { id: 'a3', n: 'Bolt', esp: 'Cão', raca: 'Poodle', tutor: 't1', notes: [], vac: [] }
    ],
    ags: [
      { id: 'g1', pet: 'a1', serv: 'banho', pro: 'p3', data: t, hora: '09:00' },
      { id: 'g2', pet: 'a2', serv: 'consulta', pro: 'p1', data: t, hora: '10:00' },
      { id: 'g3', pet: 'a3', serv: 'tosa', pro: 'p4', data: addDays(t, 1), hora: '14:00' }
    ]
  };
}
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || seed(); } catch (e) { return seed(); } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* armazenamento indisponível */ } }

let db = load();
const ui = { view: 'agenda', date: today(), pet: null, role: 'staff', tutor: 't1', draft: {}, q: '' };
const pet = id => db.pets.find(p => p.id === id);
const tutor = id => db.tutors.find(t => t.id === id);
const pn = id => PROS.find(p => p.id === id).n;
const visiblePets = () => ui.role === 'staff' ? db.pets : db.pets.filter(p => p.tutor === ui.tutor);

// Regra central: impede choque de horário (mesmo profissional OU mesmo pet)
function conflict(a) {
  const s = toMin(a.hora), e = s + SERVICES[a.serv].m;
  if (a.data < today()) return 'Data no passado.';
  if (s < OPEN || e > CLOSE) return 'Fora do horário de funcionamento (08:00–18:00).';
  const c = db.ags.find(x => x.id !== a.id && x.data === a.data && (x.pro === a.pro || x.pet === a.pet) &&
    s < toMin(x.hora) + SERVICES[x.serv].m && toMin(x.hora) < e);
  return c ? `Conflito de horário com o agendamento das ${c.hora} (${esc(pn(c.pro))}).` : '';
}
function nextFree(a) {
  for (let m = toMin(a.hora); m + SERVICES[a.serv].m <= CLOSE; m += STEP) {
    const h = hm(m);
    if (!conflict({ ...a, hora: h })) return h;
  }
  return null;
}
const readForm = () => Object.fromEntries(new FormData($('#f')).entries());

function render() {
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.v === ui.view));
  document.querySelectorAll('main>section').forEach(s => { s.hidden = s.id !== ui.view; });
  ({ agenda: rAgenda, novo: rNovo, pets: rPets, lembretes: rLemb })[ui.view]();
}

function rAgenda() {
  const el = $('#agenda'), d = ui.date;
  if (ui.role === 'tutor') {
    const mine = db.ags.filter(a => pet(a.pet).tutor === ui.tutor && a.data >= today()).sort(byDT);
    el.innerHTML = '<h2>Meus agendamentos</h2>' + (mine.length ? `<ul class="list">${mine.map(a =>
      `<li><b>${fmt(a.data)} ${a.hora}</b> — ${esc(pet(a.pet).n)} · ${SERVICES[a.serv].n} com ${esc(pn(a.pro))} <button data-a="del" data-id="${a.id}">Cancelar</button></li>`).join('')}</ul>` : '<p>Nenhum agendamento futuro.</p>');
    return;
  }
  const day = db.ags.filter(a => a.data === d);
  let free = 0, total = 0, rows = '';
  for (let m = OPEN; m < CLOSE; m += STEP) {
    rows += `<tr><th>${hm(m)}</th>` + PROS.map(p => {
      total++;
      const x = day.find(a => a.pro === p.id && toMin(a.hora) <= m && m < toMin(a.hora) + SERVICES[a.serv].m);
      if (!x) { free++; return `<td class="free" data-a="slot" data-pro="${p.id}" data-h="${hm(m)}">livre</td>`; }
      return toMin(x.hora) === m
        ? `<td class="busy ${p.t}">${esc(pet(x.pet).n)} · ${SERVICES[x.serv].n} <button data-a="del" data-id="${x.id}" title="Cancelar">✕</button></td>`
        : `<td class="busy ${p.t} cont">↳</td>`;
    }).join('') + '</tr>';
  }
  el.innerHTML = `<div class="bar"><button data-a="day" data-n="-1">◀</button><input type="date" id="dt" value="${d}"><button data-a="day" data-n="1">▶</button></div>
    <p><b>${day.length}</b> agendamentos · ocupação <b>${Math.round(100 * (total - free) / total)}%</b> · <b>${free}</b> janelas ociosas (clique em "livre" para agendar)</p>
    <div class="scroll"><table class="grid"><tr><th></th>${PROS.map(p => `<th>${esc(p.n)}</th>`).join('')}</tr>${rows}</table></div>`;
}

function rNovo() {
  const v = ui.draft, pets = visiblePets(), serv = v.serv || 'banho';
  const pros = PROS.filter(p => p.t === SERVICES[serv].t);
  const sel = (val, cur) => val === cur ? 'selected' : '';
  $('#novo').innerHTML = `<h2>Novo agendamento</h2><form id="f" class="form">
    <label>Pet<select name="pet">${pets.map(p => `<option value="${p.id}" ${sel(p.id, v.pet)}>${esc(p.n)} — ${esc(tutor(p.tutor).n)}</option>`).join('')}</select></label>
    <label>Serviço<select name="serv">${Object.entries(SERVICES).map(([k, s]) => `<option value="${k}" ${sel(k, serv)}>${s.n} (${s.m} min)</option>`).join('')}</select></label>
    <label>Profissional<select name="pro">${pros.map(p => `<option value="${p.id}" ${sel(p.id, v.pro)}>${esc(p.n)}</option>`).join('')}</select></label>
    <label>Data<input type="date" name="data" min="${today()}" value="${v.data || ui.date}" required></label>
    <label>Horário<input type="time" name="hora" step="1800" min="08:00" max="17:30" value="${v.hora || '09:00'}" required></label>
    <button type="submit"><b>Confirmar agendamento</b></button><div id="msg"></div></form>`;
}

function ficha(p) {
  const staff = ui.role === 'staff', hist = db.ags.filter(a => a.pet === p.id).sort(byDT);
  return `<h2>${esc(p.n)}</h2><p>${esc(p.esp)} · ${esc(p.raca)} · Tutor: ${esc(tutor(p.tutor).n)}</p>
  <h3>Vacinas</h3><ul class="list">${p.vac.map(v => `<li>${esc(v.n)} — aplicada em ${fmt(v.d)}; próxima: <b class="${v.prox < today() ? 'late' : ''}">${fmt(v.prox)}</b></li>`).join('') || '<li>Sem registros.</li>'}</ul>
  ${staff ? `<form data-f="vac" class="inline"><input name="n" placeholder="Vacina" required><label>Aplicada <input type="date" name="d" required></label><label>Próxima <input type="date" name="prox" required></label><button>Registrar vacina</button></form>` : ''}
  <h3>Prontuário</h3><ul class="list">${[...p.notes].reverse().map(n => `<li><b>${fmt(n.d)}</b> — ${esc(n.txt)}</li>`).join('') || '<li>Sem anotações.</li>'}</ul>
  ${staff ? `<form data-f="note" class="inline"><textarea name="txt" placeholder="Anotação clínica…" required></textarea><button>Salvar anotação</button></form>` : ''}
  <h3>Histórico de serviços (saúde + estética)</h3><ul class="list">${hist.map(a => `<li>${fmt(a.data)} ${a.hora} — ${SERVICES[a.serv].n} (${esc(pn(a.pro))})</li>`).join('') || '<li>Nenhum.</li>'}</ul>`;
}

function rPets() {
  const q = ui.q.toLowerCase(), all = visiblePets();
  const list = all.filter(p => (p.n + tutor(p.tutor).n).toLowerCase().includes(q));
  const sel = all.find(p => p.id === ui.pet);
  $('#pets').innerHTML = `<div class="cols"><div><input id="q" placeholder="Buscar pet ou tutor…" value="${esc(ui.q)}">
    <ul class="list">${list.map(p => `<li><button class="lnk ${sel && sel.id === p.id ? 'on' : ''}" data-a="pet" data-id="${p.id}">${esc(p.n)} <small>${esc(p.esp)} · ${esc(tutor(p.tutor).n)}</small></button></li>`).join('')}</ul></div>
    <div>${sel ? ficha(sel) : '<p>Selecione um pet para abrir o prontuário.</p>'}</div></div>`;
}

function rLemb() {
  const t = today(), lim = addDays(t, 30), mine = visiblePets(), items = [];
  const wa = (p, txt) => `https://wa.me/${tutor(p.tutor).tel}?text=${encodeURIComponent(txt)}`;
  mine.forEach(p => p.vac.filter(v => v.prox <= lim).forEach(v => items.push({ p, v })));
  items.sort((a, b) => a.v.prox.localeCompare(b.v.prox));
  const amanha = db.ags.filter(a => a.data === addDays(t, 1) && mine.some(p => p.id === a.pet));
  $('#lembretes').innerHTML = `<h2>Vacinas atrasadas ou a vencer (30 dias)</h2><ul class="list">${items.map(({ p, v }) => {
    const late = v.prox < t;
    const txt = `Olá, ${tutor(p.tutor).n}! A vacina ${v.n} do(a) ${p.n} ${late ? 'está atrasada desde' : 'vence em'} ${fmt(v.prox)}. Quer agendar na PetVida?`;
    return `<li class="${late ? 'late' : ''}"><b>${esc(p.n)}</b> — ${esc(v.n)}: ${fmt(v.prox)} ${late ? '(ATRASADA)' : ''} <a target="_blank" rel="noopener" href="${wa(p, txt)}">Enviar lembrete por WhatsApp</a></li>`;
  }).join('') || '<li>Nada pendente.</li>'}</ul>
  <h2>Confirmações de amanhã</h2><ul class="list">${amanha.map(a => {
    const p = pet(a.pet), txt = `Olá, ${tutor(p.tutor).n}! Confirmamos ${SERVICES[a.serv].n} do(a) ${p.n} amanhã às ${a.hora} na PetVida. Responda SIM para confirmar.`;
    return `<li><b>${a.hora}</b> — ${esc(p.n)} · ${SERVICES[a.serv].n} <a target="_blank" rel="noopener" href="${wa(p, txt)}">Pedir confirmação</a></li>`;
  }).join('') || '<li>Sem agendamentos amanhã.</li>'}</ul>`;
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-v],[data-a]');
  if (!b) return;
  if (b.dataset.v) { ui.view = b.dataset.v; return render(); }
  const a = b.dataset.a;
  if (a === 'day') ui.date = addDays(ui.date, +b.dataset.n);
  else if (a === 'slot') {
    const isVet = PROS.find(p => p.id === b.dataset.pro).t === 'vet';
    ui.draft = { pro: b.dataset.pro, hora: b.dataset.h, data: ui.date, serv: isVet ? 'consulta' : 'banho' };
    ui.view = 'novo';
  } else if (a === 'del') {
    if (!confirm('Cancelar este agendamento?')) return;
    db.ags = db.ags.filter(x => x.id !== b.dataset.id); save();
  } else if (a === 'pet') ui.pet = b.dataset.id;
  else if (a === 'alt') ui.draft.hora = b.dataset.h;
  else if (a === 'reset') { if (!confirm('Restaurar dados de exemplo?')) return; db = seed(); save(); ui.pet = null; }
  render();
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'dt') { ui.date = t.value || today(); render(); }
  else if (t.id === 'role') { ui.role = t.value; $('#tutor').hidden = ui.role !== 'tutor'; ui.pet = null; ui.draft = {}; ui.view = 'agenda'; render(); }
  else if (t.id === 'tutor') { ui.tutor = t.value; ui.pet = null; ui.draft = {}; render(); }
  else if (t.closest('#f') && t.name === 'serv') { ui.draft = readForm(); delete ui.draft.pro; rNovo(); }
});

document.addEventListener('input', e => {
  if (e.target.id !== 'q') return;
  ui.q = e.target.value; rPets();
  const q = $('#q'); q.focus(); q.setSelectionRange(q.value.length, q.value.length);
});

document.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  if (f.id === 'f') {
    const a = readForm(); a.id = 'g' + Date.now();
    const err = conflict(a);
    if (err) {
      const alt = nextFree(a);
      ui.draft = a;
      $('#msg').innerHTML = `<div class="err">${err}${alt ? ` Próximo horário livre: <button type="button" data-a="alt" data-h="${alt}">${alt}</button>` : ' Sem horários livres neste dia.'}</div>`;
      return;
    }
    db.ags.push(a); save(); ui.date = a.data; ui.draft = {}; ui.view = 'agenda'; render();
  } else if (f.dataset.f) {
    const p = pet(ui.pet), v = Object.fromEntries(new FormData(f));
    if (f.dataset.f === 'note') p.notes.push({ d: today(), txt: v.txt });
    else p.vac.push({ n: v.n, d: v.d, prox: v.prox });
    save(); rPets();
  }
});

$('#tutor').innerHTML = db.tutors.map(t => `<option value="${t.id}">${esc(t.n)}</option>`).join('');
render();
