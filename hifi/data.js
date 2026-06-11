/* ====== data + store (window globals) ====== */
window.DEFAULT_CATS = {
  eletro:  { name:"Eletrônicos", ini:"E", color:"var(--eletro)" },
  moda:    { name:"Moda",        ini:"M", color:"var(--moda)" },
  casa:    { name:"Casa",        ini:"C", color:"var(--casa)" },
  livros:  { name:"Livros",      ini:"L", color:"var(--livros)" },
  beleza:  { name:"Beleza",      ini:"B", color:"var(--beleza)" },
  esporte: { name:"Esporte",     ini:"E", color:"var(--esporte)" },
};
window.CAT_PALETTE = ["var(--eletro)","var(--moda)","var(--casa)","var(--livros)","var(--beleza)","var(--esporte)","var(--reposicao)","var(--mauve)","var(--brown)","var(--gold)"];
/* window.CATS is the LIVE, in-place-mutated object every component reads */
window.CATS = JSON.parse(JSON.stringify(window.DEFAULT_CATS));
window.setCatsInPlace = function(next){
  Object.keys(window.CATS).forEach(k=>{ if(!(k in next)) delete window.CATS[k]; });
  Object.keys(next).forEach(k=>{ window.CATS[k] = next[k]; });
};
/* priority doubles as status: Reposição (urgent rebuy) → Quero muito → Talvez → Algum dia */
window.PRIOS = {
  0: { label:"Reposição",   color:"var(--reposicao)" },
  1: { label:"Quero muito", color:"var(--want)" },
  2: { label:"Talvez",      color:"var(--pri2)" },
  3: { label:"Algum dia",   color:"var(--pri3)" },
};
window.PRI_ORDER = [0,1,2,3];

window.SEED = [
  { id:1, t:"Fone Bluetooth ANC", cat:"eletro", min:320, max:590, pri:1, date:"2026-06-02", bought:false,
    notes:"Esperar a Black Friday? Quero o cancelamento de ruído bom.",
    links:[{s:"Amazon",p:449,best:true,url:"https://www.amazon.com.br/s?k=Fone%20Bluetooth%20ANC"},{s:"Mercado Livre",p:470,best:false,url:"https://lista.mercadolivre.com.br/Fone%20Bluetooth%20ANC"},{s:"Magalu",p:510,best:false,url:"https://www.magazineluiza.com.br/busca/Fone%20Bluetooth%20ANC"}] },
  { id:2, t:"Tênis de corrida", cat:"esporte", min:340, max:520, pri:1, date:"2026-05-30", bought:false,
    notes:"Número 41. Conferir se tem na cor azul.",
    links:[{s:"Netshoes",p:359,best:true,url:"https://www.netshoes.com.br/busca?nsCat=Natural&q=T%C3%AAnis%20de%20corrida"},{s:"Nike",p:399,best:false,url:"https://www.nike.com.br/busca?q=T%C3%AAnis%20de%20corrida"}] },
  { id:3, t:"Cadeira ergonômica", cat:"casa", min:980, max:1650, pri:2, date:"2026-05-28", bought:false,
    notes:"Pra parar de doer as costas no home office.",
    links:[{s:"Amazon",p:1180,best:false,url:"https://www.amazon.com.br/s?k=Cadeira%20ergon%C3%B4mica"},{s:"Madeira Madeira",p:980,best:true,url:"https://www.madeiramadeira.com.br/busca?q=Cadeira%20ergon%C3%B4mica"}] },
  { id:4, t:"Câmera instantânea", cat:"eletro", min:480, max:640, pri:3, date:"2026-05-21", bought:false,
    notes:"", links:[{s:"Magalu",p:499,best:true,url:"https://www.magazineluiza.com.br/busca/C%C3%A2mera%20instant%C3%A2nea"}] },
  { id:5, t:"Cafeteira italiana", cat:"casa", min:140, max:230, pri:2, date:"2026-05-18", bought:false,
    notes:"Tamanho 6 xícaras.", links:[{s:"Amazon",p:169,best:true,url:"https://www.amazon.com.br/s?k=Cafeteira%20italiana"},{s:"Casas Bahia",p:189,best:false,url:"https://www.casasbahia.com.br/busca/Cafeteira%20italiana"}] },
  { id:6, t:"Livro: O Hobbit (capa dura)", cat:"livros", min:45, max:95, pri:2, date:"2026-05-15", bought:false,
    notes:"Edição capa dura se possível.", links:[{s:"Amazon",p:54,best:true,url:"https://www.amazon.com.br/s?k=Livro%3A%20O%20Hobbit"},{s:"Estante Virtual",p:45,best:false,url:"https://www.estantevirtual.com.br/busca?q=Livro%3A%20O%20Hobbit"}] },
  { id:7, t:"Mochila urbana", cat:"moda", min:200, max:340, pri:3, date:"2026-05-12", bought:false,
    notes:"", links:[{s:"Samsonite",p:289,best:true,url:"https://www.samsonite.com.br/busca?q=Mochila%20urbana"}] },
  { id:8, t:"Monitor 27\" 144hz", cat:"eletro", min:920, max:1450, pri:1, date:"2026-05-09", bought:false,
    notes:"Pra jogar e trabalhar. IPS de preferência.",
    links:[{s:"Kabum",p:1099,best:true,url:"https://www.kabum.com.br/busca/Monitor%2027%5C"},{s:"Amazon",p:1149,best:false,url:"https://www.amazon.com.br/s?k=Monitor%2027%5C"},{s:"Pichau",p:1130,best:false,url:"https://www.pichau.com.br/search?q=Monitor%2027%5C"}] },
  { id:9, t:"Perfume importado", cat:"beleza", min:280, max:430, pri:2, date:"2026-05-05", bought:false,
    notes:"Provar na loja antes.", links:[{s:"Sephora",p:329,best:true,url:"https://www.sephora.com.br/busca?q=Perfume%20importado"},{s:"Época",p:355,best:false,url:"https://www.epocacosmeticos.com.br/busca?busca=Perfume%20importado"}] },
  { id:10, t:"Luminária de mesa", cat:"casa", min:110, max:190, pri:3, date:"2026-04-28", bought:true,
    notes:"Já comprei! 🎉", links:[{s:"Amazon",p:139,best:true,url:"https://www.amazon.com.br/s?k=Lumin%C3%A1ria%20de%20mesa"}] },
  { id:11, t:"Caderno pontilhado", cat:"livros", min:38, max:80, pri:3, date:"2026-04-22", bought:false,
    notes:"", links:[{s:"Amazon",p:49,best:true,url:"https://www.amazon.com.br/s?k=Caderno%20pontilhado"}] },
  { id:12, t:"Smartwatch fitness", cat:"eletro", min:520, max:890, pri:2, date:"2026-04-20", bought:false,
    notes:"Medir batimentos e sono.", links:[{s:"Amazon",p:649,best:true,url:"https://www.amazon.com.br/s?k=Smartwatch%20fitness"},{s:"Fast Shop",p:699,best:false,url:"https://www.fastshop.com.br/web/busca?q=Smartwatch%20fitness"}] },
  { id:13, t:"Ração do gato (10kg)", cat:"casa", min:120, max:180, pri:0, date:"2026-06-04", bought:false,
    notes:"Acabando! Comprar até o fim da semana.", links:[{s:"Petz",p:139,best:true,url:"https://www.petz.com.br/busca?q=ra%C3%A7%C3%A3o%20gato"},{s:"Cobasi",p:149,best:false,url:"https://www.cobasi.com.br/pesquisa?q=ra%C3%A7%C3%A3o%20gato"}] },
  { id:14, t:"Refil do filtro de água", cat:"casa", min:45, max:75, pri:0, date:"2026-06-03", bought:false,
    notes:"Trocar a cada 3 meses — já passou do prazo.", links:[{s:"Amazon",p:49,best:true,url:"https://www.amazon.com.br/s?k=refil%20filtro%20de%20%C3%A1gua"}] },
  { id:15, t:"Pasta de dente (kit)", cat:"beleza", min:18, max:35, pri:0, date:"2026-06-01", bought:false,
    notes:"", links:[{s:"Magalu",p:24,best:true,url:"https://www.magazineluiza.com.br/busca/pasta%20de%20dente"}] },
];

/* ---- helpers ---- */
window.brl = (n) => "R$\u00a0" + Math.round(n).toLocaleString("pt-BR");
window.brlk = (n) => n>=1000 ? "R$\u00a0"+(n/1000).toFixed(1).replace(".",",")+"k" : "R$\u00a0"+Math.round(n);
window.avgPrice = (it) => {
  const prices = it.links.map(l=>l.p).filter(p=>p>0);
  if(prices.length) return prices.reduce((a,b)=>a+b,0)/prices.length;
  return (it.min+it.max)/2;
};
window.bestLink = (it) => it.links.find(l=>l.best) || it.links[0] || null;
/* images are stored as {src, fx, fy} objects; strings/legacy .img auto-upgrade on read */
window.imgsOf = (it) => {
  let raw = (it.imgs && it.imgs.length) ? it.imgs : (it.img ? [it.img] : []);
  return raw.map(x => typeof x === "string"
    ? { src:x, fx:50, fy:50 }
    : { src:x.src, fx: (x.fx==null?50:x.fx), fy: (x.fy==null?50:x.fy) });
};
window.coverOf = (it) => window.imgsOf(it)[0] || null;
window.objPos = (im) => im ? `${im.fx}% ${im.fy}%` : "50% 50%";
/* safe category accessor — never returns undefined */
window.catOf = (key) => window.CATS[key] || window.CATS[Object.keys(window.CATS)[0]] || { name:"—", ini:"?", color:"var(--ink3)" };
window.fmtDate = (iso) => {
  const d = new Date(iso+"T00:00:00");
  return d.toLocaleDateString("pt-BR",{ day:"2-digit", month:"short" });
};

/* downscale an uploaded image file to a compact dataURL + auto-detect focal point */
window.fileToImg = function(file, cb){
  if(!file || !file.type || !file.type.startsWith("image/")) return;
  const r = new FileReader();
  r.onload = (e)=>{
    const img = new Image();
    img.onload = ()=>{
      const max = 900; let w = img.width, h = img.height;
      if(w>max || h>max){ const s = Math.min(max/w, max/h); w = Math.round(w*s); h = Math.round(h*s); }
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      let fx = 50, fy = 50;
      try{ const f = window.detectFocus(ctx, w, h); fx = f.x; fy = f.y; }catch(err){}
      let src;
      try{ src = c.toDataURL("image/jpeg", 0.85); }catch(err){ src = e.target.result; }
      cb({ src, fx, fy });
    };
    img.src = e.target.result;
  };
  r.readAsDataURL(file);
};

/* find the centre of the “interesting” (non-white, non-transparent) pixels */
window.detectFocus = function(ctx, w, h){
  const step = Math.max(1, Math.floor(Math.min(w,h)/140));
  const data = ctx.getImageData(0,0,w,h).data;
  let sx=0, sy=0, n=0, minX=w, minY=h, maxX=0, maxY=0;
  for(let y=0;y<h;y+=step){
    for(let x=0;x<w;x+=step){
      const i=(y*w+x)*4;
      const r=data[i], g=data[i+1], b=data[i+2], a=data[i+3];
      if(a<16) continue;                       // transparent background
      if(r>238 && g>238 && b>238) continue;     // near-white background
      if(r<14 && g<14 && b<14) continue;        // near-black (often shadows/letterbox)
      sx+=x; sy+=y; n++;
      if(x<minX)minX=x; if(x>maxX)maxX=x;
      if(y<minY)minY=y; if(y>maxY)maxY=y;
    }
  }
  if(n < 24) return { x:50, y:50 };
  const cx = sx/n, cy = sy/n;                   // centroid of content
  const bx = (minX+maxX)/2, by = (minY+maxY)/2; // bbox centre
  const fx = ((cx*0.6 + bx*0.4)/w)*100;
  const fy = ((cy*0.6 + by*0.4)/h)*100;
  return { x: Math.round(Math.max(12, Math.min(88, fx))), y: Math.round(Math.max(12, Math.min(88, fy))) };
};

/* ---- localStorage-backed store hook ---- */
const STORE_KEY = "wishlist-hifi-v1";
const META_KEY = "wishlist-hifi-meta-v1";
const CAT_KEY = "wishlist-hifi-cats-v1";
window.useStore = function useStore(){
  const [cats, setCatsState] = React.useState(()=>{
    let init = window.DEFAULT_CATS;
    try{ const raw = localStorage.getItem(CAT_KEY); if(raw){ const p = JSON.parse(raw); if(p && Object.keys(p).length) init = p; } }catch(e){}
    window.setCatsInPlace(init);   // apply synchronously so first render uses correct categories
    return init;
  });
  const [items, setItems] = React.useState(()=>{
    let arr; try{ const raw = localStorage.getItem(STORE_KEY); if(raw) arr = JSON.parse(raw); }catch(e){}
    if(!Array.isArray(arr)) arr = window.SEED;
    const fallback = Object.keys(window.CATS)[0] || "casa";
    // migrate items whose category no longer exists (e.g. old "reposicao" category → Reposição status)
    return arr.map(it=> window.CATS[it.cat] ? it
      : ({ ...it, cat:fallback, pri: it.cat==="reposicao" ? 0 : it.pri }));
  });
  const [meta, setMetaState] = React.useState(()=>{
    const v = localStorage.getItem(META_KEY); return v ? Number(v) : 0;
  });
  window.setCatsInPlace(cats);   // keep window.CATS in sync with state on EVERY render (no one-frame lag)
  React.useEffect(()=>{ try{ localStorage.setItem(STORE_KEY, JSON.stringify(items)); }catch(e){} }, [items]);
  React.useEffect(()=>{ try{ localStorage.setItem(META_KEY, String(meta)); }catch(e){} }, [meta]);
  React.useEffect(()=>{ try{ localStorage.setItem(CAT_KEY, JSON.stringify(cats)); }catch(e){} }, [cats]);

  const api = React.useMemo(()=>({
    items, meta, cats,
    setMeta(v){ setMetaState(Math.max(0, Number(v)||0)); },
    /* replace the whole category map; reassign items whose category was removed */
    setCats(next){
      const removed = Object.keys(cats).filter(k=>!(k in next));
      const fallback = Object.keys(next)[0] || "casa";
      if(removed.length){ setItems(prev=>prev.map(it=> removed.includes(it.cat) ? {...it, cat:fallback} : it)); }
      setCatsState(next);
    },
    resetCats(){ setCatsState(window.DEFAULT_CATS); },
    upsert(it){
      setItems(prev=>{
        if(it.id && prev.some(p=>p.id===it.id)) return prev.map(p=>p.id===it.id?{...p,...it}:p);
        const id = Math.max(0,...prev.map(p=>p.id))+1;
        return [{...it, id, date: it.date || new Date().toISOString().slice(0,10)}, ...prev];
      });
    },
    remove(id){ setItems(prev=>prev.filter(p=>p.id!==id)); },
    toggleBought(id){ setItems(prev=>prev.map(p=>p.id===id?{...p,bought:!p.bought}:p)); },
    setBest(id, idx){ setItems(prev=>prev.map(p=>p.id!==id?p:{...p, links:p.links.map((l,i)=>({...l,best:i===idx}))})); },
    /* reorder a visible subset, keeping hidden items in place */
    reorderSubset(shownIds){
      setItems(prev=>{
        const shown = new Set(shownIds);
        const map = Object.fromEntries(prev.map(p=>[p.id,p]));
        let q = 0;
        return prev.map(p=> shown.has(p.id) ? map[shownIds[q++]] : p);
      });
    },
    reset(){ setItems(window.SEED); },
    replaceAll(arr){ if(Array.isArray(arr)) setItems(arr); },
  }), [items, meta, cats]);
  return api;
};
