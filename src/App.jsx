import { useState, useEffect, useRef } from 'react';
import { useStore } from './store/useStore';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakSlider, TweakButton } from './components/TweaksPanel';
import { StatsRow, MetaBar, Toolbar, QuickChips, Sidebar, SelectionBar, activeCount, applyFilters, MuralView, CategoryView, ListView } from './views/views';
import { ItemDetail, AddEditForm, CategoryManager } from './components/Detail';

const TWEAK_DEFAULTS = {
  accent: "#57314C",
  theme: "Creme",
  view: "mural",
  density: "regular",
  fontSize: 16,
  highlight: "Sólido",
};

const HL_MAP = { "Sólido":"solid", "Suave":"soft", "Contorno":"outline" };
const VIEWS = [
  { id:"mural", label:"Mural",      ic:"▦" },
  { id:"cat",   label:"Categorias", ic:"☰" },
  { id:"list",  label:"Lista",      ic:"≡" },
];

export default function App(){
  const store = useStore();
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useState(t.view);
  const [filters, setFilters] = useState({ cats:[], pris:[], status:"all", priceMax:null });
  const [sort, setSort] = useState("date");
  const [sidebarOn, setSidebarOn] = useState(false);
  const [selMode, setSelMode] = useState(false);
  const [selIds, setSelIds] = useState(()=>new Set());
  const [open, setOpen] = useState(null);
  const [editing, setEditing] = useState(undefined);
  const [manageCats, setManageCats] = useState(false);

  useEffect(()=>setView(t.view), [t.view]);
  useEffect(()=>{
    document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.style.setProperty("--accent-soft", t.accent+"22");
    document.documentElement.style.setProperty("--fs", t.fontSize+"px");
    const theme = t.theme==="Vinho" ? "theme-dark" : "theme-light";
    document.body.className = theme+" density-"+t.density+" hl-"+(HL_MAP[t.highlight]||"solid");
  }, [t.accent, t.fontSize, t.density, t.highlight, t.theme]);

  const shown = applyFilters(store.items, filters, sort);
  const ViewComp = { mural:MuralView, cat:CategoryView, list:ListView }[view];
  const anyFilter = activeCount(filters)>0;

  const toggleSel=(id)=>setSelIds(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  const sel={ active:selMode, ids:selIds, toggle:toggleSel };
  const exitSel=()=>{ setSelMode(false); setSelIds(new Set()); };
  const liveOpen = open ? store.items.find(i=>i.id===open.id) : null;

  const importRef = useRef(null);
  const exportList=()=>{
    const data={ app:"to-querendo-gastar", version:1, exportedAt:new Date().toISOString(), meta:store.meta, items:store.items };
    const blob=new Blob([JSON.stringify(data,null,2)],{ type:"application/json" });
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="minha-lista-de-desejos.json"; a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  };
  const importList=(e)=>{
    const f=e.target.files&&e.target.files[0]; e.target.value="";
    if(!f) return;
    const r=new FileReader();
    r.onload=(ev)=>{
      try{
        const d=JSON.parse(ev.target.result);
        const arr=Array.isArray(d)?d:d.items;
        if(!Array.isArray(arr)) throw new Error("sem itens");
        store.replaceAll(arr);
        if(typeof d.meta==="number") store.setMeta(d.meta);
        alert("Lista importada com "+arr.length+" itens!");
      }catch(err){ alert("Não consegui ler esse arquivo. Use um .json exportado por este app."); }
    };
    r.readAsText(f);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-row">
          <div className="brand">
            <div className="logo">T</div>
            <div>
              <h1>Tô Querendo Gastar</h1>
              <p>minha lista de desejos</p>
            </div>
          </div>
          <div className="spacer"></div>
          <div className="viewswitch">
            {VIEWS.map(v=>(
              <button key={v.id} className={view===v.id?"on":""} onClick={()=>setView(v.id)}>{v.label}</button>
            ))}
          </div>
          <button className="addbtn" onClick={()=>setEditing(null)}><span className="p">+</span> adicionar</button>
        </div>
      </header>

      <StatsRow items={store.items} />
      <MetaBar items={store.items} meta={store.meta} onSetMeta={store.setMeta} />
      <Toolbar filters={filters} sidebarOn={sidebarOn} onToggleSidebar={()=>setSidebarOn(s=>!s)}
        selOn={selMode} onToggleSel={()=>{ setSelMode(s=>!s); if(selMode) setSelIds(new Set()); }}
        sort={sort} setSort={setSort} />
      {!sidebarOn&&<QuickChips filters={filters} setFilters={setFilters} cats={store.cats} />}

      {sidebarOn ? (
        <div className="withside">
          <Sidebar filters={filters} setFilters={setFilters} items={store.items} onManageCats={()=>setManageCats(true)} cats={store.cats} />
          <div className="sidemain">
            <ViewComp items={shown} onOpen={setOpen} onAdd={()=>setEditing(null)} sort={sort} onReorder={store.reorderSubset} sel={sel} anyFilter={anyFilter} cats={store.cats} />
          </div>
        </div>
      ) : (
        <ViewComp items={shown} onOpen={setOpen} onAdd={()=>setEditing(null)} sort={sort} onReorder={store.reorderSubset} sel={sel} anyFilter={anyFilter} cats={store.cats} />
      )}

      {selMode&&<SelectionBar items={store.items} ids={selIds} onClear={()=>setSelIds(new Set())} onClose={exitSel} />}
      {liveOpen&&<ItemDetail item={liveOpen} store={store} onClose={()=>setOpen(null)} onEdit={it=>{ setOpen(null); setEditing(it); }} />}
      {editing!==undefined&&<AddEditForm item={editing} store={store} onClose={()=>setEditing(undefined)} />}
      {manageCats&&<CategoryManager store={store} onClose={()=>setManageCats(false)} />}

      <input ref={importRef} type="file" accept="application/json,.json" style={{display:"none"}} onChange={importList} />
      <TweaksPanel>
        <TweakSection label="Aparência" />
        <TweakRadio label="Tema" value={t.theme} options={["Creme","Vinho"]} onChange={v=>setTweak("theme",v)} />
        <TweakColor label="Cor de destaque" value={t.accent}
          options={["#57314C","#7C5A6E","#7A8650","#6F4A3A","#97743A","#9B3B54"]}
          onChange={v=>setTweak("accent",v)} />
        <TweakRadio label="Estilo de destaque" value={t.highlight} options={["Sólido","Suave","Contorno"]} onChange={v=>setTweak("highlight",v)} />
        <TweakRadio label="Densidade" value={t.density} options={["compact","regular"]} onChange={v=>setTweak("density",v)} />
        <TweakSlider label="Tamanho do texto" value={t.fontSize} min={14} max={19} unit="px" onChange={v=>setTweak("fontSize",v)} />
        <TweakSection label="Visualização inicial" />
        <TweakRadio label="Abrir em" value={t.view} options={["mural","cat","list"]} onChange={v=>setTweak("view",v)} />
        <TweakSection label="Dados" />
        <TweakButton label="Gerenciar categorias" onClick={()=>setManageCats(true)} />
        <TweakButton label="Exportar lista (.json)" secondary onClick={exportList} />
        <TweakButton label="Importar lista" secondary onClick={()=>importRef.current&&importRef.current.click()} />
        <TweakButton label="Restaurar exemplos" secondary onClick={()=>{ if(confirm("Restaurar a lista de exemplo? Suas alterações serão perdidas.")) store.reset(); }} />
      </TweaksPanel>
    </div>
  );
}
