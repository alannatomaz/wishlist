/* ============ data ============ */
const CATS = {
  eletro: { name:"Eletrônicos", emoji:"🎧" },
  moda:   { name:"Moda",        emoji:"👟" },
  casa:   { name:"Casa",        emoji:"🛋️" },
  livros: { name:"Livros",      emoji:"📚" },
  beleza: { name:"Beleza",      emoji:"🌸" },
};
const ITEMS = [
  { id:1, t:"Fone Bluetooth ANC", cat:"eletro", avg:450, min:320, max:590, pri:1, date:"02/06", h:150, bought:false,
    notes:"Esperar a Black Friday? Quero o cancelamento de ruído bom.",
    links:[{s:"Amazon",p:449,best:true},{s:"Mercado Livre",p:470,best:false},{s:"Magalu",p:510,best:false}] },
  { id:2, t:"Tênis de corrida", cat:"moda", avg:380, min:340, max:520, pri:1, date:"30/05", h:200, bought:false,
    notes:"Número 41. Conferir se tem na cor azul.",
    links:[{s:"Netshoes",p:359,best:true},{s:"Nike",p:399,best:false}] },
  { id:3, t:"Cadeira ergonômica", cat:"casa", avg:1200, min:980, max:1650, pri:2, date:"28/05", h:160, bought:false,
    notes:"Pra parar de doer as costas no home office.",
    links:[{s:"Amazon",p:1180,best:false},{s:"Madeira Madeira",p:980,best:true}] },
  { id:4, t:"Câmera instantânea", cat:"eletro", avg:520, min:480, max:640, pri:3, date:"21/05", h:190, bought:false,
    notes:"", links:[{s:"Magalu",p:499,best:true}] },
  { id:5, t:"Cafeteira italiana", cat:"casa", avg:180, min:140, max:230, pri:2, date:"18/05", h:140, bought:false,
    notes:"Tamanho 6 xícaras.", links:[{s:"Amazon",p:169,best:true},{s:"Casas Bahia",p:189,best:false}] },
  { id:6, t:"Livro: O Hobbit", cat:"livros", avg:70, min:45, max:95, pri:2, date:"15/05", h:210, bought:false,
    notes:"Edição capa dura se possível.", links:[{s:"Amazon",p:54,best:true},{s:"Estante Virtual",p:45,best:false}] },
  { id:7, t:"Mochila urbana", cat:"moda", avg:260, min:200, max:340, pri:3, date:"12/05", h:175, bought:false,
    notes:"", links:[{s:"Samsonite",p:289,best:true}] },
  { id:8, t:"Monitor 27\" 144hz", cat:"eletro", avg:1100, min:920, max:1450, pri:1, date:"09/05", h:130, bought:false,
    notes:"Pra jogar e trabalhar. IPS de preferência.",
    links:[{s:"Kabum",p:1099,best:true},{s:"Amazon",p:1149,best:false},{s:"Pichau",p:1130,best:false}] },
  { id:9, t:"Perfume importado", cat:"beleza", avg:340, min:280, max:430, pri:2, date:"05/05", h:185, bought:false,
    notes:"Provar na loja antes.", links:[{s:"Sephora",p:329,best:true},{s:"Época",p:355,best:false}] },
  { id:10, t:"Luminária de mesa", cat:"casa", avg:150, min:110, max:190, pri:3, date:"28/04", h:160, bought:true,
    notes:"Já comprei! 🎉", links:[{s:"Amazon",p:139,best:true}] },
  { id:11, t:"Caderno pontilhado", cat:"livros", avg:55, min:38, max:80, pri:3, date:"22/04", h:200, bought:false,
    notes:"", links:[{s:"Amazon",p:49,best:true}] },
  { id:12, t:"Smartwatch fitness", cat:"eletro", avg:680, min:520, max:890, pri:2, date:"20/04", h:170, bought:false,
    notes:"Medir batimentos e sono.", links:[{s:"Amazon",p:649,best:true},{s:"Fast Shop",p:699,best:false}] },
];

/* ============ helpers ============ */
const brl = n => "R$ " + n.toLocaleString("pt-BR");
const brlk = n => n>=1000 ? "R$ "+(n/1000).toFixed(1).replace(".",",")+"k" : "R$ "+n;
const priClass = p => p===1?"want":p===2?"maybe":"some";
const priLabel = p => p===1?"♥ quero muito":p===2?"talvez":"algum dia";
const priChip  = p => `<span class="chip ${priClass(p)}"><span class="pdot p${p}"></span>${priLabel(p)}</span>`;
const catChip  = c => `<span class="chip cat">${CATS[c].emoji} ${CATS[c].name}</span>`;

function imgph(h, label){ return `<div class="imgph${label?' lbl':''}" ${label?`data-l="${label}"`:''} style="height:${h}px"></div>`; }

function card(it, opts={}){
  const stamp = it.bought ? `<div class="bought-stamp">comprado ✓</div>` : "";
  return `<div class="card sketch${it.bought?' bought':''}" style="position:relative">
    ${stamp}
    ${imgph(it.h)}
    <div class="body">
      <h3>${it.t}</h3>
      <div class="meta">${catChip(it.cat)} ${priChip(it.pri)}</div>
      <div class="price">${brl(it.avg)} <span class="rng">(${brl(it.min)}–${brl(it.max)})</span></div>
      <div class="foot"><span>add ${it.date}</span><span>🔗 ${it.links.length} lojas</span></div>
    </div>
  </div>`;
}

const sortSelect = `<span class="chip sm">ordenar: data ▾</span>`;
const catFilters = `<span class="chip solid-want sm">Tudo</span>` +
  Object.values(CATS).map(c=>`<span class="chip cat sm">${c.emoji} ${c.name}</span>`).join("");

const totalAll = ITEMS.filter(i=>!i.bought).reduce((s,i)=>s+i.avg,0);
const totalBought = ITEMS.filter(i=>i.bought).reduce((s,i)=>s+i.avg,0);
const cntWant = ITEMS.filter(i=>i.pri===1&&!i.bought).length;

/* ============ TAB A — Mural Pinterest ============ */
function tabA(){
  return `
  <div class="paneltitle"><h2>A · Mural estilo Pinterest</h2>
    <span class="sub">grade "caótica" com alturas variadas — visual, gostoso de rolar</span></div>
  <div class="bar">
    <div class="summary">
      <div class="stat sketch sm"><b>${ITEMS.filter(i=>!i.bought).length}</b><span>itens na lista</span></div>
      <div class="stat sketch sm"><b>${brlk(totalAll)}</b><span>se comprar tudo</span></div>
      <div class="stat sketch sm"><b>${cntWant}</b><span>quero muito ♥</span></div>
    </div>
    <span class="grow"></span>
    <button class="btn accent">+ adicionar</button>
  </div>
  <div class="bar">${catFilters}<span class="grow"></span>${sortSelect}</div>
  <div class="anno">Filtros e ordenação no topo; cada card mostra foto, preço médio + faixa, categoria e prioridade num relance.</div>
  <div class="masonry">
    ${ITEMS.map(it=>card(it)).join("")}
    <div class="card sketch alt addcard"><div class="plus">+</div><div>novo desejo</div></div>
  </div>`;
}

/* ============ TAB B — Por Categoria ============ */
function tabB(){
  const secs = Object.entries(CATS).map(([k,c])=>{
    const its = ITEMS.filter(i=>i.cat===k);
    if(!its.length) return "";
    const sub = its.filter(i=>!i.bought).reduce((s,i)=>s+i.avg,0);
    return `<div class="catsec">
      <div class="cathead">
        <h3>${c.emoji} ${c.name}</h3>
        <span class="cnt">${its.length} ${its.length>1?"itens":"item"}</span>
        <span class="sub">subtotal: <b>${brlk(sub)}</b></span>
      </div>
      <div class="hscroll">${its.map(it=>card(it)).join("")}
        <div class="card sketch alt addcard" style="flex:0 0 130px"><div class="plus">+</div></div>
      </div>
    </div>`;
  }).join("");
  return `
  <div class="paneltitle"><h2>B · Agrupado por categoria</h2>
    <span class="sub">seções empilhadas, cada tipo numa faixa rolável + subtotal</span></div>
  <div class="anno">Ótimo pra quem pensa "o que eu quero de eletrônicos?". Cada seção tem contagem e subtotal próprio.</div>
  ${secs}`;
}

/* ============ TAB C — Dashboard + Filtros ============ */
function tabC(){
  const flt = (label,ck)=>`<div class="flt"><span class="box${ck?' ck':''}"></span>${label}</div>`;
  return `
  <div class="paneltitle"><h2>C · Painel com filtros</h2>
    <span class="sub">barra lateral de filtros + estatísticas no topo — modo "controle total"</span></div>
  <div class="summary" style="margin-bottom:18px">
    <div class="stat sketch"><b>${ITEMS.length}</b><span>itens no total</span></div>
    <div class="stat sketch"><b>${brlk(totalAll)}</b><span>se comprar tudo</span></div>
    <div class="stat sketch"><b>${brlk(totalBought)}</b><span>já comprei</span></div>
    <div class="stat sketch"><b>${cntWant}</b><span>prioridade alta</span></div>
  </div>
  <div class="dash-grid">
    <aside class="sidebar sketch">
      <div>
        <h4>Categoria</h4>
        ${Object.values(CATS).map((c,i)=>flt(c.emoji+" "+c.name, i<2)).join("")}
      </div>
      <div>
        <h4>Faixa de preço</h4>
        <div class="slider"></div>
        <div class="foot mono" style="display:flex;justify-content:space-between;color:var(--ink-soft);font-size:12px"><span>R$ 50</span><span>R$ 1.6k</span></div>
      </div>
      <div>
        <h4>Prioridade</h4>
        ${flt("♥ Quero muito",true)}${flt("Talvez",false)}${flt("Algum dia",false)}
      </div>
      <div>
        <h4>Status</h4>
        ${flt("Pendentes",true)}${flt("Comprados",false)}
      </div>
    </aside>
    <div>
      <div class="anno">Esquerda fixa filtra a grade da direita. Os 4 números do topo respondem "quanto isso tudo vai me custar?".</div>
      <div class="grid">${ITEMS.slice(0,8).map(it=>card(it)).join("")}</div>
    </div>
  </div>`;
}

/* ============ TAB D — Lista + Detalhe ============ */
function tabD(){
  const sel = ITEMS[0];
  const rows = ITEMS.slice(0,6).map((it,i)=>`
    <div class="row sketch sm ${i===0?'sel':''}">
      <div class="th imgph"></div>
      <div class="info"><h4>${it.t}</h4><span>${CATS[it.cat].emoji} · ${brl(it.avg)}</span></div>
      <span class="pdot p${it.pri}"></span>
    </div>`).join("");
  return `
  <div class="paneltitle"><h2>D · Lista + detalhe (split)</h2>
    <span class="sub">lista compacta à esquerda, painel de detalhe à direita</span></div>
  <div class="anno">Bom pra desktop: rola a lista enxuta e vê tudo do item selecionado sem abrir outra tela.</div>
  <div class="split">
    <div class="list">${rows}<div class="row sketch sm dash" style="justify-content:center;color:var(--ink-soft)">+ adicionar</div></div>
    ${detailBlock(sel, true)}
  </div>`;
}

/* ============ TAB E — Detalhe do item ============ */
function tabE(){
  return `
  <div class="paneltitle"><h2>E · Detalhe do item</h2>
    <span class="sub">a tela "por dentro" de um desejo: imagens, faixa de preço, links com "melhor opção"</span></div>
  <div class="anno">Coração da ideia: várias lojas, e você marca a ⭐ na que vale mais a pena. O preço médio sai dos links.</div>
  <div style="max-width:760px">${detailBlock(ITEMS[7], false)}</div>`;
}

function detailBlock(it, compact){
  const span = it.max - it.min || 1;
  const pinPct = ((it.avg - it.min)/span)*100;
  const links = it.links.map(l=>`
    <div class="linkrow sketch sm${l.best?' best':''}">
      <div class="store"><b>${l.s}</b><span class="mono">${l.best?'★ melhor opção':'link salvo'}</span></div>
      <span class="price">${brl(l.p)}</span>
      <span class="star${l.best?' on':''}">★</span>
    </div>`).join("");
  return `<div class="detail sketch">
    <div class="gallery">
      <div class="imgph main"></div>
      <div class="thumbs"><div class="imgph"></div><div class="imgph"></div></div>
    </div>
    <div class="meta" style="display:flex;gap:8px;margin-bottom:8px">${catChip(it.cat)} ${priChip(it.pri)} ${it.bought?'<span class="chip buy">✓ comprado</span>':''}</div>
    <h2>${it.t}</h2>
    <div class="foot mono" style="color:var(--ink-soft);margin-bottom:18px">adicionado em ${it.date}</div>

    <div class="label">Preço médio &amp; faixa</div>
    <div class="track">
      <div class="fill" style="left:0;right:0"></div>
      <div class="pin" style="left:${pinPct}%"><span>${brl(it.avg)}</span></div>
      <div class="ends"><span>min ${brl(it.min)}</span><span>max ${brl(it.max)}</span></div>
    </div>

    <div class="row2" style="margin-top:26px">
      <div class="col">
        <div class="label">Onde comprar (${it.links.length} lojas)</div>
        <div class="links">${links}</div>
      </div>
      <div class="col">
        <div class="label">Minhas notas</div>
        <div class="notes sketch sm">${it.notes || "—"}</div>
        <div class="label" style="margin-top:16px">Ações</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn fill">✓ marcar como comprado</button>
          <button class="btn">editar</button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ============ TAB F — Mobile ============ */
function tabF(){
  const mcard = it=>`<div class="card sketch sm" style="position:relative">${imgph(Math.round(it.h*0.7))}
    <div class="body" style="padding:7px 8px;gap:4px">
      <h3 style="font-size:14px">${it.t}</h3>
      <div class="price" style="font-size:14px">${brl(it.avg)}</div>
      <div class="meta"><span class="chip cat sm" style="font-size:10px;padding:0 6px">${CATS[it.cat].emoji}</span><span class="pdot p${it.pri}"></span></div>
    </div></div>`;
  return `
  <div class="paneltitle"><h2>F · No celular</h2>
    <span class="sub">o mesmo mural num feed mobile + a tela de detalhe rolável</span></div>
  <div class="phones">
    <div class="phone">
      <div class="notch"></div>
      <div class="screen">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <b style="font-size:17px">Tô querendo 💸</b><span class="chip sm" style="font-size:11px">${brlk(totalAll)}</span>
        </div>
        <div class="mchips"><span class="chip solid-want sm">Tudo</span>${Object.values(CATS).slice(0,4).map(c=>`<span class="chip cat sm">${c.emoji}</span>`).join("")}</div>
        <div class="mmason" style="flex:1;overflow:hidden">${ITEMS.slice(0,6).map(mcard).join("")}</div>
      </div>
      <div class="fab">+</div>
      <div class="bottomnav"><span><b>▦</b>mural</span><span><b>≡</b>categorias</span><span><b>★</b>quero</span><span><b>◔</b>gastos</span></div>
      <div class="cap">feed principal + botão flutuante de adicionar</div>
    </div>
    <div class="phone">
      <div class="notch"></div>
      <div class="screen mscroll">
        <div class="imgph" style="height:150px;flex:none"></div>
        <div style="display:flex;gap:6px">${catChip(ITEMS[7].cat)} ${priChip(ITEMS[7].pri)}</div>
        <h3 style="margin:0;font-size:19px">${ITEMS[7].t}</h3>
        <div class="price">${brl(ITEMS[7].avg)} <span class="rng">(${brl(ITEMS[7].min)}–${brl(ITEMS[7].max)})</span></div>
        <div class="track" style="margin:24px 4px 4px"><div class="fill" style="left:0;right:0"></div><div class="pin" style="left:50%"><span>média</span></div></div>
        <div class="label" style="margin-top:14px">Lojas</div>
        ${ITEMS[7].links.map(l=>`<div class="linkrow sketch sm${l.best?' best':''}" style="padding:7px 10px"><div class="store"><b style="font-size:14px">${l.s}</b></div><span class="price" style="font-size:14px">${brl(l.p)}</span><span class="star${l.best?' on':''}">★</span></div>`).join("")}
        <button class="btn fill" style="margin-top:8px">✓ comprei</button>
      </div>
      <div class="cap">detalhe rolável com links + melhor opção</div>
    </div>
  </div>`;
}

/* ============ mount ============ */
const TABS = [
  { id:"a", label:"Mural", sub:"pinterest", fn:tabA },
  { id:"b", label:"Categorias", sub:"seções", fn:tabB },
  { id:"c", label:"Painel", sub:"filtros", fn:tabC },
  { id:"d", label:"Lista+Detalhe", sub:"split", fn:tabD },
  { id:"e", label:"Detalhe", sub:"item", fn:tabE },
  { id:"f", label:"Celular", sub:"mobile", fn:tabF },
];

function init(){
  const tabsEl = document.getElementById("tabs");
  const wrap = document.getElementById("panels");
  tabsEl.innerHTML = TABS.map((t,i)=>`<button class="tab${i===0?' active':''}" data-tab="${t.id}">${t.label}<small>${t.sub}</small></button>`).join("");
  wrap.innerHTML = TABS.map((t,i)=>`<div class="panel${i===0?' active':''}" id="p-${t.id}">${t.fn()}</div>`).join("");

  tabsEl.addEventListener("click", e=>{
    const b = e.target.closest(".tab"); if(!b) return;
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    document.getElementById("p-"+b.dataset.tab).classList.add("active");
    localStorage.setItem("wl-tab", b.dataset.tab);
    window.scrollTo({top:document.querySelector(".tabs").offsetTop-10, behavior:"instant"});
  });

  // restore tab
  const saved = localStorage.getItem("wl-tab");
  if(saved){ const b=document.querySelector(`.tab[data-tab="${saved}"]`); if(b) b.click(); }

  // toggles
  const annoT = document.getElementById("t-anno");
  const cleanT = document.getElementById("t-clean");
  const setTog=(el,key,cls,on)=>{ el.classList.toggle("on",on); document.body.classList.toggle(cls,key==="clean"?on:!on); localStorage.setItem("wl-"+key,on?"1":"0"); };
  let annoOn = localStorage.getItem("wl-anno")!=="0";
  let cleanOn = localStorage.getItem("wl-clean")==="1";
  setTog(annoT,"anno","no-anno",annoOn);
  setTog(cleanT,"clean","clean",cleanOn);
  annoT.addEventListener("click",()=>{ annoOn=!annoOn; setTog(annoT,"anno","no-anno",annoOn); });
  cleanT.addEventListener("click",()=>{ cleanOn=!cleanOn; setTog(cleanT,"clean","clean",cleanOn); });
}
document.addEventListener("DOMContentLoaded", init);
