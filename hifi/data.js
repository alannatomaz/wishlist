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

window.SEED = [];

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
