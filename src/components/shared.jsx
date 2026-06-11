import { useState, useRef } from 'react';
import { PRIOS, avgPrice, brl, catOf, imgsOf, coverOf, objPos, fileToImg } from '../lib/utils';

export function Thumb({ item, h, cats }){
  const cat = catOf(item.cat, cats);
  const bg = `color-mix(in srgb, ${cat.color} 15%, var(--tint))`;
  const cover = coverOf(item);
  const n = imgsOf(item).length;
  return (
    <div className="thumb" style={{ height:h, background:bg, color:cat.color }}>
      {cover
        ? <><img src={cover.src} alt={item.t} style={{ objectPosition:objPos(cover) }} />{n>1&&<span className="imgcount">{n} fotos</span>}</>
        : <><span className="mono-ini">{cat.ini}</span><span className="ph-label">{cat.name}</span></>}
    </div>
  );
}

export function Pill({ color, children, solid }){
  const style = solid
    ? { background:color, color:"#FAF6EB" }
    : { background:`color-mix(in srgb, ${color} 14%, var(--tint))`, color };
  return <span className="pill" style={style}>{children}</span>;
}

export function Tag({ color, round, children }){
  return <span className="tag"><i className="tdot" style={{ background:color, borderRadius:round?"50%":"2px" }}></i>{children}</span>;
}

export function CatPill({ cat, solid, cats }){
  const c = catOf(cat, cats);
  return solid ? <Pill color={c.color} solid>{c.name}</Pill> : <Tag color={c.color}>{c.name}</Tag>;
}

export function PriPill({ pri, solid }){
  const p = PRIOS[pri];
  return solid ? <Pill color={p.color} solid>{p.label}</Pill> : <Tag color={p.color} round>{p.label}</Tag>;
}

export function PriceTrack({ item }){
  const avg = avgPrice(item);
  const span = (item.max - item.min) || 1;
  const pct = Math.max(0, Math.min(100, ((avg - item.min)/span)*100));
  return (
    <div className="track">
      <div className="fill" style={{ left:0, right:0 }}></div>
      <div className="pin" style={{ left:pct+"%" }}><span>{brl(avg)}</span></div>
      <div className="ends"><span>min {brl(item.min)}</span><span>max {brl(item.max)}</span></div>
    </div>
  );
}

export function Card({ item, onOpen, drag, dragProps, dropover, selecting, selected, onToggleSel, cats }){
  const avg = avgPrice(item);
  const p = PRIOS[item.pri];
  const handle = ()=> selecting ? onToggleSel(item.id) : onOpen(item);
  return (
    <div className={"card"+(item.bought?" bought":"")+(drag?" draggable":"")+(dropover?" dropover":"")+(selecting?" selecting":"")+(selected?" selected":"")}
      draggable={drag||undefined} {...(dragProps||{})} onClick={handle}>
      {selecting&&<span className={"selcheck"+(selected?" on":"")}>{selected?"✓":""}</span>}
      <Thumb item={item} h={item._h||150} cats={cats} />
      <div className="pri-flag" style={{ background:p.color }} title={p.label}></div>
      {item.bought&&<div className="boughttag">comprado</div>}
      <div className="cardbody">
        <h3>{item.t}</h3>
        <div className="pillrow"><CatPill cat={item.cat} cats={cats} /></div>
        <div className="cardprice">
          <span className="avg">{brl(avg)}</span>
          <span className="rng">{brl(item.min)}–{brl(item.max)}</span>
        </div>
        <div className="cardfoot">
          <span>{item.links.length} {item.links.length===1?"loja":"lojas"}</span>
        </div>
      </div>
    </div>
  );
}

export function Stat({ k, v, accent }){
  return (
    <div className={"statcard"+(accent?" accent":"")}>
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}

export function ImageDrop({ value, onChange, className, style, children }){
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);
  const handle = (f)=>{ if(f) fileToImg(f, onChange); };
  const preview = value && (typeof value==="string" ? value : value.src);
  return (
    <div className={(className||"")+(over?" dragover":"")} style={style}
      onClick={e=>{ e.stopPropagation(); inputRef.current.click(); }}
      onDragOver={e=>{ e.preventDefault(); setOver(true); }}
      onDragLeave={()=>setOver(false)}
      onDrop={e=>{ e.preventDefault(); setOver(false); handle(e.dataTransfer.files&&e.dataTransfer.files[0]); }}>
      <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}}
        onChange={e=>{ handle(e.target.files&&e.target.files[0]); e.target.value=""; }} />
      {preview ? <img src={preview} alt="" className="dropimg" /> : children}
    </div>
  );
}

export function FocusEditor({ image, onChange, onDone }){
  const ref = useRef(null);
  const [pos, setPos] = useState({ x:image.fx, y:image.fy });
  const posRef = useRef(pos);
  const dragging = useRef(false);
  const move = (clientX, clientY)=>{
    const r=ref.current.getBoundingClientRect();
    let x=((clientX-r.left)/r.width)*100, y=((clientY-r.top)/r.height)*100;
    x=Math.max(0,Math.min(100,x)); y=Math.max(0,Math.min(100,y));
    const np={ x:Math.round(x), y:Math.round(y) };
    posRef.current=np; setPos(np);
  };
  const start=(e)=>{ dragging.current=true; const t=e.touches?e.touches[0]:e; move(t.clientX,t.clientY); };
  const drag=(e)=>{ if(!dragging.current) return; e.preventDefault(); const t=e.touches?e.touches[0]:e; move(t.clientX,t.clientY); };
  const end=()=>{ if(dragging.current){ dragging.current=false; onChange(posRef.current); } };
  const done=()=>{ onChange(posRef.current); onDone&&onDone(); };
  return (
    <div className="focusedit" ref={ref}
      onMouseDown={start} onMouseMove={drag} onMouseUp={end} onMouseLeave={end}
      onTouchStart={start} onTouchMove={drag} onTouchEnd={end}>
      <img src={image.src} alt="" style={{ objectPosition:`${pos.x}% ${pos.y}%` }} />
      <div className="focusgrid"></div>
      <div className="focusdot" style={{ left:pos.x+"%", top:pos.y+"%" }}></div>
      <div className="focushint">arraste para escolher o ponto em destaque</div>
      <button className="focusdone"
        onMouseDown={e=>e.stopPropagation()} onMouseUp={e=>e.stopPropagation()}
        onTouchStart={e=>e.stopPropagation()} onTouchEnd={e=>e.stopPropagation()}
        onClick={e=>{ e.stopPropagation(); done(); }}>pronto</button>
    </div>
  );
}

export function confetti(x, y){
  const colors=["#57314C","#7C5A6E","#7A8650","#A9833F","#9B3B54","#6F4A3A","#F1ECD9"];
  for(let i=0;i<22;i++){
    const d=document.createElement("div");
    const sz=6+Math.random()*6;
    d.style.cssText=`position:fixed;left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;background:${colors[i%colors.length]};border-radius:${Math.random()<.5?'50%':'2px'};pointer-events:none;z-index:9999;will-change:transform,opacity;`;
    document.body.appendChild(d);
    const ang=Math.random()*Math.PI*2, vel=80+Math.random()*140;
    const dx=Math.cos(ang)*vel, dy=Math.sin(ang)*vel-80;
    d.animate([{ transform:"translate(0,0) rotate(0)", opacity:1 },{ transform:`translate(${dx}px,${dy+240}px) rotate(${Math.random()*640}deg)`, opacity:0 }],{ duration:900+Math.random()*500, easing:"cubic-bezier(.2,.7,.3,1)" }).onfinish=()=>d.remove();
  }
}
