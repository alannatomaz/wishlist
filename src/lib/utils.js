export const DEFAULT_CATS = {
  eletro:  { name:"Eletrônicos", ini:"E", color:"var(--eletro)" },
  moda:    { name:"Moda",        ini:"M", color:"var(--moda)" },
  casa:    { name:"Casa",        ini:"C", color:"var(--casa)" },
  livros:  { name:"Livros",      ini:"L", color:"var(--livros)" },
  beleza:  { name:"Beleza",      ini:"B", color:"var(--beleza)" },
  esporte: { name:"Esporte",     ini:"E", color:"var(--esporte)" },
};

export const CAT_PALETTE = ["var(--eletro)","var(--moda)","var(--casa)","var(--livros)","var(--beleza)","var(--esporte)","var(--reposicao)","var(--mauve)","var(--brown)","var(--gold)"];

export const PRIOS = {
  0: { label:"Reposição",   color:"var(--reposicao)" },
  1: { label:"Quero muito", color:"var(--want)" },
  2: { label:"Talvez",      color:"var(--pri2)" },
  3: { label:"Algum dia",   color:"var(--pri3)" },
};

export const PRI_ORDER = [0,1,2,3];

export const SEED = [];

export const brl  = (n) => "R$ " + Math.round(n).toLocaleString("pt-BR");
export const brlk = (n) => n>=1000 ? "R$ "+(n/1000).toFixed(1).replace(".",",")+"k" : "R$ "+Math.round(n);

export const avgPrice = (it) => {
  const prices = it.links.map(l=>l.p).filter(p=>p>0);
  if(prices.length) return prices.reduce((a,b)=>a+b,0)/prices.length;
  return (it.min+it.max)/2;
};

export const bestLink = (it) => it.links.find(l=>l.best) || it.links[0] || null;

export const imgsOf = (it) => {
  let raw = (it.imgs && it.imgs.length) ? it.imgs : (it.img ? [it.img] : []);
  return raw.map(x => typeof x === "string"
    ? { src:x, fx:50, fy:50 }
    : { src:x.src, fx:(x.fx==null?50:x.fx), fy:(x.fy==null?50:x.fy) });
};

export const coverOf = (it) => imgsOf(it)[0] || null;
export const objPos  = (im) => im ? `${im.fx}% ${im.fy}%` : "50% 50%";

export const catOf = (key, cats) =>
  cats[key] || cats[Object.keys(cats)[0]] || { name:"—", ini:"?", color:"var(--ink3)" };

export const fmtDate = (iso) => {
  const d = new Date(iso+"T00:00:00");
  return d.toLocaleDateString("pt-BR",{ day:"2-digit", month:"short" });
};

export function fileToImg(file, cb){
  if(!file || !file.type || !file.type.startsWith("image/")) return;
  const r = new FileReader();
  r.onload = (e)=>{
    const img = new Image();
    img.onload = ()=>{
      const max=900; let w=img.width, h=img.height;
      if(w>max||h>max){ const s=Math.min(max/w,max/h); w=Math.round(w*s); h=Math.round(h*s); }
      const c=document.createElement("canvas"); c.width=w; c.height=h;
      const ctx=c.getContext("2d"); ctx.drawImage(img,0,0,w,h);
      let fx=50, fy=50;
      try{ const f=detectFocus(ctx,w,h); fx=f.x; fy=f.y; }catch(err){}
      let src;
      try{ src=c.toDataURL("image/jpeg",0.85); }catch(err){ src=e.target.result; }
      cb({ src, fx, fy });
    };
    img.src = e.target.result;
  };
  r.readAsDataURL(file);
}

function detectFocus(ctx, w, h){
  const step=Math.max(1,Math.floor(Math.min(w,h)/140));
  const data=ctx.getImageData(0,0,w,h).data;
  let sx=0,sy=0,n=0,minX=w,minY=h,maxX=0,maxY=0;
  for(let y=0;y<h;y+=step){
    for(let x=0;x<w;x+=step){
      const i=(y*w+x)*4;
      const r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];
      if(a<16) continue;
      if(r>238&&g>238&&b>238) continue;
      if(r<14&&g<14&&b<14) continue;
      sx+=x; sy+=y; n++;
      if(x<minX)minX=x; if(x>maxX)maxX=x;
      if(y<minY)minY=y; if(y>maxY)maxY=y;
    }
  }
  if(n<24) return { x:50, y:50 };
  const cx=sx/n, cy=sy/n;
  const bx=(minX+maxX)/2, by=(minY+maxY)/2;
  const fx=((cx*0.6+bx*0.4)/w)*100;
  const fy=((cy*0.6+by*0.4)/h)*100;
  return { x:Math.round(Math.max(12,Math.min(88,fx))), y:Math.round(Math.max(12,Math.min(88,fy))) };
}

