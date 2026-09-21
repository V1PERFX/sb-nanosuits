/* Estado do checklist + render da lista. Tudo salvo no localStorage deste navegador. */

const CHAVE = 'sb-nanosuits-v1';

const slug = (s) => s.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const SUITS = NANOSUITS.map((s, i) => ({ ...s, id: slug(s.n), ordem: i }));

const estado = {
  feitas: new Set(),
  run: 3,
  regiao: 'todas',
  ordem: 'inventario',
  busca: '',
  ocultar: false,
  salvoEm: null
};

/* ---------- persistência ---------- */

function carregar() {
  let bruto = null;
  try { bruto = localStorage.getItem(CHAVE); } catch (e) { return; }
  if (!bruto) return;
  try {
    const dados = JSON.parse(bruto);
    if (Array.isArray(dados.feitas)) estado.feitas = new Set(dados.feitas);
    if ([1, 2, 3].includes(dados.run)) estado.run = dados.run;
    if (typeof dados.regiao === 'string') estado.regiao = dados.regiao;
    if (typeof dados.ordem === 'string') estado.ordem = dados.ordem;
    if (typeof dados.ocultar === 'boolean') estado.ocultar = dados.ocultar;
    if (typeof dados.salvoEm === 'number') estado.salvoEm = dados.salvoEm;
  } catch (e) { /* dados corrompidos: começa do zero */ }
}

function salvar(marcou) {
  if (marcou) estado.salvoEm = Date.now();
  try {
    localStorage.setItem(CHAVE, JSON.stringify({
      feitas: [...estado.feitas],
      run: estado.run,
      regiao: estado.regiao,
      ordem: estado.ordem,
      ocultar: estado.ocultar,
      salvoEm: estado.salvoEm
    }));
  } catch (e) { /* modo privado / storage bloqueado: segue sem salvar */ }
  carimbo();
}

function carimbo() {
  const alvo = document.getElementById('salvo-em');
  if (!estado.salvoEm) { alvo.textContent = ''; return; }
  const d = new Date(estado.salvoEm);
  alvo.textContent = 'Última marcação: ' +
    d.toLocaleDateString('pt-BR') + ' às ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + '.';
}

/* ---------- filtros ---------- */

const naRun = (s) => RUN_DE[s.t] <= estado.run;

function visiveis() {
  const q = estado.busca.trim().toLowerCase();
  return SUITS.filter((s) => {
    if (!naRun(s)) return false;
    if (estado.regiao !== 'todas' && s.r !== estado.regiao) return false;
    if (estado.ocultar && estado.feitas.has(s.id)) return false;
    if (q && !(s.n + ' ' + s.r + ' ' + s.d).toLowerCase().includes(q)) return false;
    return true;
  });
}

/* ---------- render ---------- */

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const arte = (nome) => 'assets/img/' + encodeURIComponent(nome) + '.webp';

function linha(s) {
  const feito = estado.feitas.has(s.id);
  return `<label class="item" data-feito="${feito ? 1 : 0}" style="--c: var(--t-${s.t})">
    <input type="checkbox" id="suit-${s.id}" data-id="${s.id}"${feito ? ' checked' : ''}>
    <span class="marca" aria-hidden="true"></span>
    <img class="arte" src="${arte(s.n)}" alt="" loading="lazy" decoding="async" width="1140" height="2060" data-ampliar="${esc(s.n)}">
    <span class="item__txt">
      <span class="item__nome">${esc(s.n)}</span>
      <span class="item__local">${esc(s.r === 'Inicial' || s.r === 'DLC' || s.r === 'História' ? s.d : s.r + ': ' + s.d)}</span>
    </span>
    <span class="chip">${TIERS[s.t].sym} ${TIERS[s.t].nome}</span>
  </label>`;
}

function grupos(lista) {
  if (estado.ordem === 'inventario') return [['Ordem do inventário', lista]];
  const mapa = new Map();
  for (const s of lista) {
    if (!mapa.has(s.r)) mapa.set(s.r, []);
    mapa.get(s.r).push(s);
  }
  return [...mapa.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
}

function render() {
  const lista = visiveis();
  const alvo = document.getElementById('lista');

  alvo.innerHTML = grupos(lista).map(([titulo, itens]) => {
    const feitos = itens.filter((s) => estado.feitas.has(s.id)).length;
    return `<section class="grupo">
      <h2 class="grupo__titulo">${esc(titulo)} <em>${feitos}/${itens.length}</em></h2>
      <div class="itens">${itens.map(linha).join('')}</div>
    </section>`;
  }).join('');

  document.getElementById('vazio').hidden = lista.length > 0;
  placar();
}

function placar() {
  const escopo = SUITS.filter(naRun);
  const feitas = escopo.filter((s) => estado.feitas.has(s.id)).length;
  const pct = escopo.length ? Math.round((feitas / escopo.length) * 100) : 0;

  document.getElementById('contador').textContent = feitas;
  document.getElementById('total').textContent = '/' + escopo.length;
  document.getElementById('medidor').style.width = pct + '%';
  document.getElementById('medidor-wrap').setAttribute(
    'aria-label', `Progresso: ${feitas} de ${escopo.length} nanosuits (${pct}%)`
  );
  document.getElementById('escopo-label').textContent =
    estado.run === 3 ? 'coletadas no total' : `obteníveis até ${estado.run === 1 ? 'a 1ª run' : 'o NG+'}`;

  document.getElementById('tiles').innerHTML = Object.keys(TIERS).map((t) => {
    const doTier = SUITS.filter((s) => s.t === t);
    const ok = doTier.filter((s) => estado.feitas.has(s.id)).length;
    const bloqueado = RUN_DE[t] > estado.run;
    return `<li style="--c: var(--t-${t})" data-completo="${ok === doTier.length ? 1 : 0}">
      <b>${ok}/${doTier.length}</b>
      <span>${TIERS[t].nome}${bloqueado ? ' · travado' : ''}</span>
    </li>`;
  }).join('');
}

/* ---------- montagem ---------- */

function montarRegioes() {
  const sel = document.getElementById('regiao');
  const regioes = [...new Set(SUITS.map((s) => s.r))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  sel.innerHTML = '<option value="todas">Todas as regiões</option>' +
    regioes.map((r) => `<option value="${esc(r)}">${esc(r)}</option>`).join('');
  sel.value = regioes.includes(estado.regiao) ? estado.regiao : 'todas';
  estado.regiao = sel.value;
}

function montarLegenda() {
  document.getElementById('legenda').innerHTML = Object.keys(TIERS).map((t) =>
    `<li style="--c: var(--t-${t})"><b>${TIERS[t].sym} ${TIERS[t].nome}</b><span>${TIERS[t].desc}</span></li>`
  ).join('');
}

function marcarRun() {
  document.querySelectorAll('.seg__btn').forEach((b) => {
    b.setAttribute('aria-pressed', String(Number(b.dataset.run) === estado.run));
  });
}

carregar();
montarRegioes();
montarLegenda();
marcarRun();
document.getElementById('ordem').value = estado.ordem;
document.getElementById('ocultar').checked = estado.ocultar;
carimbo();
render();

/* ---------- visualizador da arte ---------- */

const visor = document.getElementById('visor');

const visorImg = visor.querySelector('img');
let pedido = 0;

function abrirVisor({ url, titulo, alt, proporcao }) {
  const meu = ++pedido;            /* descarta carregamentos que o usuário já trocou */

  visor.querySelector('h2').textContent = titulo;
  visor.classList.add('carregando');   /* esconde a arte anterior enquanto a nova baixa */
  visor.classList.toggle('visor--largo', proporcao > 1);
  visorImg.style.aspectRatio = String(proporcao);
  visorImg.alt = alt;
  visorImg.src = url;
  if (!visor.open) visor.showModal();

  const pronto = () => { if (meu === pedido) visor.classList.remove('carregando'); };
  if (visorImg.decode) visorImg.decode().then(pronto, pronto);
  else if (visorImg.complete) pronto();
  else visorImg.addEventListener('load', pronto, { once: true });
}

document.getElementById('lista').addEventListener('click', (e) => {
  const img = e.target.closest('.arte');
  if (!img) return;
  e.preventDefault();              /* não marca a suit ao clicar na arte */
  const nome = img.dataset.ampliar;
  abrirVisor({
    url: arte(nome),
    titulo: nome,
    alt: 'Arte da nanosuit ' + nome,
    proporcao: 1140 / 2060
  });
});

/* passar o mouse sobre a miniatura já baixa a arte grande, então o visor abre pronto */
const aquecidas = new Set();
document.getElementById('lista').addEventListener('pointerover', (e) => {
  const img = e.target.closest('.arte');
  if (!img || aquecidas.has(img.dataset.ampliar)) return;
  aquecidas.add(img.dataset.ampliar);
  new Image().src = arte(img.dataset.ampliar);
});

visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });
visor.querySelector('[data-fechar]').addEventListener('click', () => visor.close());

document.getElementById('lista').addEventListener('change', (e) => {
  const cb = e.target.closest('input[data-id]');
  if (!cb) return;
  const id = cb.dataset.id;
  if (cb.checked) estado.feitas.add(id); else estado.feitas.delete(id);
  salvar(true);

  const item = cb.closest('.item');
  if (estado.ocultar) { render(); return; }
  item.dataset.feito = cb.checked ? '1' : '0';
  const grupo = item.closest('.grupo');
  const itens = grupo.querySelectorAll('.item');
  const feitos = grupo.querySelectorAll('.item[data-feito="1"]').length;
  grupo.querySelector('em').textContent = `${feitos}/${itens.length}`;
  placar();
});

document.querySelectorAll('.seg__btn').forEach((b) => {
  b.addEventListener('click', () => {
    estado.run = Number(b.dataset.run);
    marcarRun(); salvar(); render();
  });
});

let timer;
document.getElementById('busca').addEventListener('input', (e) => {
  estado.busca = e.target.value;
  clearTimeout(timer);
  timer = setTimeout(render, 120);
});

document.getElementById('regiao').addEventListener('change', (e) => {
  estado.regiao = e.target.value; salvar(); render();
});

document.getElementById('ordem').addEventListener('change', (e) => {
  estado.ordem = e.target.value; salvar(); render();
});

document.getElementById('ocultar').addEventListener('change', (e) => {
  estado.ocultar = e.target.checked; salvar(); render();
});

document.getElementById('zerar').addEventListener('click', () => {
  if (!estado.feitas.size) return;
  if (!confirm(`Desmarcar as ${estado.feitas.size} nanosuits já coletadas?`)) return;
  estado.feitas.clear();
  salvar(true); render();
});
