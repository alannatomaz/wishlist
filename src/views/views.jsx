import { useState, useRef } from 'react';
import { PRIOS, PRI_ORDER, avgPrice, brl, brlk, catOf, coverOf, objPos, fmtDate } from '../lib/utils';
import { Card, Stat, CatPill, PriPill } from '../components/shared';

export function StatsRow({ items }){
  const pending = items.filter(i=>!i.bought);
  const totalAll = pending.reduce((s,i)=>s+avgPrice(i),0);
  const totalBought = items.filter(i=>i.bought).reduce((s,i)=>s+avgPrice(i),0);
  const want = pending.filter(i=>i.pri===1).length;
  return (
    <div className="stats">
      <Stat k="Na lista" v={pending.length} />
      <Stat k="Se comprar tudo" v={brlk(totalAll)} accent />
      <Stat k="Já comprei" v={brlk(totalBought)} />
      <Stat k="Quero muito" v={want} />
    </div>
  );
}

export function MetaBar({ items, meta, onSetMeta }){
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(meta||"");
  const total = items.filter(i=>!i.bought).reduce((s,i)=>s+avgPrice(i),0);
  const has = meta>0;
  const pct = has ? Math.min(100,(total/meta)*100) : 0;
  const over = has && total>meta;
  const near = has && !over && pct>=80;
  const color = over?"var(--want)":near?"var(--gold)":"var(--buy)";
  const save = ()=>{ onSetMeta(Number(val)||0); setEditing(false); };
  return (
    <div className="metabar">
      <div className="metatop">
        <span className="tcap">Meta de orçamento mensal</span>
        {editing ? (
          <span className="metaedit">
            <input className="inp metainp" type="number" value={val} autoFocus placeholder="0"
              onChange={e=>setVal(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") save(); if(e.key==="Escape") setEditing(false); }} />
            <button className="metabtn" onClick={save}>salvar</button>
          </span>
        ) : (
          <button className="metaval" onClick={()=>setEditing(true)}>
            {has ? brl(meta) : "definir meta"}<span className="metapen">✎</span>
          </button>
        )}
      </div>
      {has && (
        <>
          <div className="metatrack"><div className="metafill" style={{ width:pct+"%", background:color }}></div></div>
          <div className="metafoot">
            <span>{brl(total)} se comprar tudo</span>
            <span style={{ color }}>{over?"excede em "+brl(total-meta):"cabe · sobram "+brl(meta-total)}</span>
          </div>
        </>
      )}
    </div>
  );
}

function toggleIn(arr, val){ arr=arr||[]; return arr.includes(val)?arr.filter(x=>x!==val):[...arr,val]; }

export function activeCount(filters){
  return (filters.cats?.length||0)+(filters.pris?.length||0)+(filters.status!=="all"?1:0)+(filters.priceMax!=null?1:0);
}

export function Toolbar({ filters, sidebarOn, onToggleSidebar, selOn, onToggleSel, sort, setSort }){
  const n = activeCount(filters);
  return (
    <div className="toolbar">
      <button className={"toolbtn"+(sidebarOn?" on":"")} onClick={onToggleSidebar}>
        <span className="tb-ic">☰</span> Filtros{n>0&&<span className="tb-badge">{n}</span>}
      </button>
      <button className={"toolbtn"+(selOn?" on":"")} onClick={onToggleSel}>
        <span className="tb-ic">{selOn?"✓":"○"}</span> Selecionar
      </button>
      <span className="tb-spacer"></span>
      <label className="tb-sort">
        <span className="tcap">ordenar</span>
        <select className="nat" value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="date">Mais recentes</option>
          <option value="date-asc">Mais antigos</option>
          <option value="price-asc">Preço: menor</option>
          <option value="price-desc">Preço: maior</option>
          <option value="pri">Prioridade</option>
          <option value="az">Nome A–Z</option>
          <option value="manual">Minha ordem</option>
        </select>
      </label>
    </div>
  );
}

export function QuickChips({ filters, setFilters, cats }){
  const activeCats=filters.cats||[], pris=filters.pris||[];
  const tCat=(c)=>setFilters(f=>({...f,cats:toggleIn(f.cats,c)}));
  const tPri=(p)=>setFilters(f=>({...f,pris:toggleIn(f.pris,p)}));
  const setStatus=(v)=>setFilters(f=>({...f,status:v}));
  return (
    <div className="quickchips">
      <div className="chips">
        <button className={"chip"+(!activeCats.length?" on":"")} onClick={()=>setFilters(f=>({...f,cats:[]}))}>Tudo</button>
        {Object.entries(cats).map(([k,c])=>(
          <button key={k} className={"chip"+(activeCats.includes(k)?" on":"")} onClick={()=>tCat(k)}>
            <span className="dot" style={{background:c.color}}></span>{c.name}
          </button>
        ))}
      </div>
      <div className="chips" style={{marginTop:9}}>
        {[["all","Todos"],["bought","Comprados"]].map(([v,l])=>(
          <button key={v} className={"chip"+(filters.status===v?" on":"")} onClick={()=>setStatus(v)}>{l}</button>
        ))}
        {PRI_ORDER.map(p=>(
          <button key={p} className={"chip"+(pris.includes(p)?" on":"")} onClick={()=>tPri(p)}>
            <span className="dot" style={{background:PRIOS[p].color,borderRadius:"50%"}}></span>{PRIOS[p].label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Sidebar({ filters, setFilters, items, onManageCats, cats }){
  const activeCats=filters.cats||[], pris=filters.pris||[];
  const tCat=(c)=>setFilters(f=>({...f,cats:toggleIn(f.cats,c)}));
  const tPri=(p)=>setFilters(f=>({...f,pris:toggleIn(f.pris,p)}));
  const setStatus=(v)=>setFilters(f=>({...f,status:v}));
  const maxP=Math.max(100,...items.map(i=>Math.ceil(avgPrice(i)/100)*100));
  const cur=filters.priceMax==null?maxP:filters.priceMax;
  const counts={}; items.forEach(i=>{ counts[i.cat]=(counts[i.cat]||0)+1; });
  const clear=()=>setFilters({ cats:[], pris:[], status:"all", priceMax:null });
  const Check=({on,color,round,children,onClick})=>(
    <button className="checkrow" onClick={onClick}>
      <span className={"ck"+(on?" on":"")}>{on?"✓":""}</span>
      {color&&<span className="ckdot" style={{ background:color, borderRadius:round?"50%":"3px" }}></span>}
      <span className="cklabel">{children}</span>
    </button>
  );
  return (
    <aside className="sidebar">
      <div className="side-head">
        <span className="tcap">Filtros</span>
        {activeCount(filters)>0&&<button className="side-clear" onClick={clear}>limpar</button>}
      </div>
      <div className="side-sec">
        <div className="side-sechead">
          <h4>Categoria</h4>
          <button className="side-edit" onClick={onManageCats}>editar</button>
        </div>
        {Object.entries(cats).map(([k,c])=>(
          <Check key={k} on={activeCats.includes(k)} color={c.color} onClick={()=>tCat(k)}>
            {c.name}<span className="ckcount">{counts[k]||0}</span>
          </Check>
        ))}
      </div>
      <div className="side-sec">
        <h4>Prioridade</h4>
        {PRI_ORDER.map(p=>(<Check key={p} on={pris.includes(p)} color={PRIOS[p].color} round onClick={()=>tPri(p)}>{PRIOS[p].label}</Check>))}
      </div>
      <div className="side-sec">
        <h4>Status</h4>
        {[["all","Todos"],["bought","Comprados"]].map(([v,l])=>(<Check key={v} on={filters.status===v} onClick={()=>setStatus(v)}>{l}</Check>))}
      </div>
      <div className="side-sec">
        <h4>Preço médio até</h4>
        <input className="side-range" type="range" min={100} max={maxP} step={50}
          value={cur} onChange={e=>{ const v=Number(e.target.value); setFilters(f=>({...f,priceMax:v>=maxP?null:v})); }} />
        <div className="side-rangeval">{filters.priceMax==null?"qualquer preço":"até "+brl(filters.priceMax)}</div>
      </div>
    </aside>
  );
}

export function SelectionBar({ items, ids, onClear, onClose }){
  const chosen = items.filter(i=>ids.has(i.id));
  const total = chosen.reduce((s,i)=>s+avgPrice(i),0);
  return (
    <div className="selbar">
      <div className="selbar-left">
        <span className="selcount">{chosen.length}</span>
        <span className="sellabel">{chosen.length===1?"item selecionado":"itens selecionados"}</span>
      </div>
      <div className="selbar-total">
        <span className="seltotal">{brl(total)}</span>
        <span className="tcap">total se comprar só estes</span>
      </div>
      <div className="selbar-actions">
        <button className="selact" disabled={!chosen.length} onClick={onClear}>limpar</button>
        <button className="selact ghost" onClick={onClose}>sair</button>
      </div>
    </div>
  );
}

export function applyFilters(items, filters, sort){
  const cats=filters.cats||[], pris=filters.pris||[];
  let out=items.filter(i=>{
    if(cats.length&&!cats.includes(i.cat)) return false;
    if(pris.length&&!pris.includes(i.pri)) return false;
    if(filters.status==="pending"&&i.bought) return false;
    if(filters.status==="bought"&&!i.bought) return false;
    if(filters.priceMax!=null&&avgPrice(i)>filters.priceMax) return false;
    return true;
  });
  const cmp={ "date":(a,b)=>b.date.localeCompare(a.date), "date-asc":(a,b)=>a.date.localeCompare(b.date), "price-asc":(a,b)=>avgPrice(a)-avgPrice(b), "price-desc":(a,b)=>avgPrice(b)-avgPrice(a), "pri":(a,b)=>a.pri-b.pri, "az":(a,b)=>a.t.localeCompare(b.t,"pt-BR"), "manual":()=>0 }[sort]||(()=>0);
  return out.sort(cmp);
}

function Empty({ onAdd, filtered }){
  return (
    <div className="empty">
      <div className="big">❮❯</div>
      <h3>{filtered?"Nada com esses filtros":"Nada por aqui ainda"}</h3>
      <p>{filtered?"Tente afrouxar os filtros.":"Que tal adicionar a primeira coisa que você tá querendo?"}</p>
      {!filtered&&<button className="addbtn" style={{margin:"18px auto 0"}} onClick={onAdd}><span className="p">+</span> adicionar desejo</button>}
    </div>
  );
}

const HEIGHTS=[150,200,168,186,140,210,176,132,190,160,204,172];
function withH(items){ return items.map(it=>({ ...it, _h:HEIGHTS[it.id%HEIGHTS.length] })); }

function useReorder(items, onReorder, enabled){
  const dragId=useRef(null);
  const [overId, setOverId]=useState(null);
  const props=(id)=>!enabled?{}:{
    draggable:true,
    onDragStart:(e)=>{ dragId.current=id; e.dataTransfer.effectAllowed="move"; },
    onDragOver:(e)=>{ e.preventDefault(); if(overId!==id) setOverId(id); },
    onDragEnd:()=>{ dragId.current=null; setOverId(null); },
    onDrop:(e)=>{ e.preventDefault(); const from=dragId.current; dragId.current=null; setOverId(null);
      if(from==null||from===id) return; const ids=items.map(i=>i.id);
      const a=ids.indexOf(from), b=ids.indexOf(id); if(a<0||b<0) return;
      ids.splice(b,0,ids.splice(a,1)[0]); onReorder(ids); },
  };
  return { props, overId };
}

export function MuralView({ items, onOpen, onAdd, sort, onReorder, sel, anyFilter, cats }){
  const manual=sort==="manual"&&!sel.active;
  const { props, overId }=useReorder(items, onReorder, manual);
  if(!items.length) return <Empty onAdd={onAdd} filtered={anyFilter} />;
  return (
    <>
      {manual&&<div className="reorder-hint">Arraste os cards para reordenar — esta é a sua "Minha ordem".</div>}
      <div className="masonry">
        {withH(items).map(it=><Card key={it.id} item={it} onOpen={onOpen} drag={manual} dragProps={props(it.id)} dropover={overId===it.id}
          selecting={sel.active} selected={sel.ids.has(it.id)} onToggleSel={sel.toggle} cats={cats} />)}
        {!manual&&!sel.active&&<button className="card addtile" onClick={onAdd}><span className="p">+</span>novo desejo</button>}
      </div>
    </>
  );
}

export function CategoryView({ items, onOpen, onAdd, sel, anyFilter, cats }){
  if(!items.length) return <Empty onAdd={onAdd} filtered={anyFilter} />;
  const groups={};
  items.forEach(i=>{ (groups[i.cat]=groups[i.cat]||[]).push(i); });
  return (
    <div>
      {Object.entries(cats).map(([k,c])=>{
        const its=groups[k]; if(!its||!its.length) return null;
        const sub=its.filter(i=>!i.bought).reduce((s,i)=>s+avgPrice(i),0);
        return (
          <div className="catsec" key={k}>
            <div className="catsec-head">
              <div className="badge" style={{background:c.color}}>{c.ini}</div>
              <h2>{c.name}</h2>
              <span className="cnt">· {its.length} {its.length>1?"itens":"item"}</span>
              <span className="sub">{brlk(sub)} <span>se comprar tudo</span></span>
            </div>
            <div className="grid">
              {its.map(it=><Card key={it.id} item={it} onOpen={onOpen}
                selecting={sel.active} selected={sel.ids.has(it.id)} onToggleSel={sel.toggle} cats={cats} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ListView({ items, onOpen, onAdd, sort, onReorder, sel, anyFilter, cats }){
  const manual=sort==="manual"&&!sel.active;
  const { props, overId }=useReorder(items, onReorder, manual);
  if(!items.length) return <Empty onAdd={onAdd} filtered={anyFilter} />;
  return (
    <>
      {manual&&<div className="reorder-hint">Arraste as linhas para reordenar — esta é a sua "Minha ordem".</div>}
      <div className="listv">
        {items.map(it=>{
          const cat=catOf(it.cat, cats);
          const avg=avgPrice(it);
          const cover=coverOf(it);
          const selected=sel.ids.has(it.id);
          return (
            <div key={it.id}
              className={"lrow"+(it.bought?" bought":"")+(manual?" draggable":"")+(overId===it.id?" dropover":"")+(sel.active?" selecting":"")+(selected?" selected":"")}
              {...props(it.id)} onClick={()=>sel.active?sel.toggle(it.id):onOpen(it)}>
              {sel.active&&<span className={"selcheck inline"+(selected?" on":"")}>{selected?"✓":""}</span>}
              {manual&&<span className="dragh" title="arraste">⠿</span>}
              <div className="lt" style={{ background:`color-mix(in srgb, ${cat.color} 15%, var(--tint))`, color:cat.color }}>
                {cover?<img src={cover.src} alt="" style={{ objectPosition:objPos(cover) }} />:<span className="mono-ini">{cat.ini}</span>}
              </div>
              <div className="lmain">
                <h3>{it.t}</h3>
                <div className="lmeta">
                  <CatPill cat={it.cat} cats={cats} />
                  <PriPill pri={it.pri} />
                  <span style={{fontSize:10.5,color:"var(--ink3)",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>{fmtDate(it.date)} · {it.links.length} {it.links.length===1?"loja":"lojas"}</span>
                </div>
              </div>
              <div className="lprice">
                <div className="avg">{brl(avg)}</div>
                <div className="rng">{brl(it.min)}–{brl(it.max)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
