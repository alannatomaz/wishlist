/* ====== detail modal + add/edit form (window globals) ====== */
const { PriceTrack, CatPill, PriPill, ImageDrop, FocusEditor } = window;

function Modal({ children, onClose, wide }){
  React.useEffect(()=>{
    const h = e=>{ if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown",h); document.body.style.overflow="hidden";
    return ()=>{ window.removeEventListener("keydown",h); document.body.style.overflow=""; };
  },[]);
  return (
    <div className="overlay" onClick={onClose}>
      <div className={"modal"+(wide?" wide":"")} onClick={e=>e.stopPropagation()}>
        <button className="modal-x" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

function ItemDetail({ item, store, onClose, onEdit }){
  const avg = window.avgPrice(item);
  const [adjust, setAdjust] = React.useState(false);
  const setBest = (idx)=> store.setBest(item.id, idx);
  const markBought = (e)=>{
    if(!item.bought){ const r=e.currentTarget.getBoundingClientRect(); window.confetti(r.left+r.width/2, r.top); }
    store.toggleBought(item.id);
  };
  const cat = window.catOf(item.cat);
  const imgs = window.imgsOf(item);
  const cover = imgs[0] || null;
  const writeImgs = (arr)=> store.upsert({ id:item.id, imgs:arr, img:null });
  const setCoverFocus = (pos)=>{ if(!cover) return; const next=imgs.slice(); next[0]={...cover, fx:pos.x, fy:pos.y}; writeImgs(next); };
  return (
    <Modal onClose={onClose} wide>
      <div className="detail-grid">
        <div className="detail-media">
          {cover ? (
            adjust ? (
              <FocusEditor image={cover} onChange={setCoverFocus} onDone={()=>setAdjust(false)} />
            ) : (
              <div className="bigthumb" style={{ background:`color-mix(in srgb, ${cat.color} 18%, var(--tint))` }}>
                <img className="dropimg" src={cover.src} alt={item.t} style={{ objectPosition: window.objPos(cover) }} />
              </div>
            )
          ) : (
            <ImageDrop className="bigthumb" style={{ background:`color-mix(in srgb, ${cat.color} 18%, var(--tint))`, color:cat.color }}
              onChange={(im)=>writeImgs([im])}>
              <span className="mono-ini">{cat.ini}</span>
              <span className="ph-label">clique ou arraste uma foto</span>
            </ImageDrop>
          )}
          {cover && !adjust && (
            <button className="framebtn" onClick={()=>setAdjust(true)}>✥ ajustar enquadramento</button>
          )}
          <div className="gallery-thumbs">
            {imgs.map((im,i)=>(
              <div key={i} className={"gthumb"+(i===0?" iscover":"")} title={i===0?"capa":"definir como capa"}
                onClick={()=>{ if(i!==0){ writeImgs([imgs[i], ...imgs.filter((_,j)=>j!==i)]); setAdjust(false); } }}>
                <img src={im.src} alt="" style={{ objectPosition: window.objPos(im) }} />
                {i===0 && <span className="coverbadge">capa</span>}
                <button className="gthumb-x" title="remover" onClick={(e)=>{ e.stopPropagation(); writeImgs(imgs.filter((_,j)=>j!==i)); }}>✕</button>
              </div>
            ))}
            <ImageDrop className="gthumb add" onChange={(im)=>writeImgs([...imgs, im])}><span className="addphoto">+</span></ImageDrop>
          </div>
        </div>

        <div className="detail-info">
          <div className="pillrow" style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            <CatPill cat={item.cat} solid />
            <PriPill pri={item.pri} solid />
            {item.bought && <span className="pill" style={{background:"var(--buy)",color:"#FAF6EB"}}>comprado</span>}
          </div>
          <h2 className="detail-title">{item.t}</h2>
          <div className="detail-date">📅 adicionado em {window.fmtDate(item.date)}</div>

          <div className="section-label">Preço médio &amp; faixa</div>
          <PriceTrack item={item} />

          <div className="section-label" style={{marginTop:26}}>Onde comprar · {item.links.length} {item.links.length===1?"loja":"lojas"}</div>
          <div className="linklist">
            {item.links.map((l,i)=>(
              <div key={i} className={"linkrow"+(l.best?" best":"")}>
                <button className={"starbtn"+(l.best?" on":"")} title="marcar melhor opção"
                  onClick={()=>setBest(i)}>★</button>
                <div className="linkmain">
                  <b>{l.s}</b>
                  {l.best && <span className="bestlbl">melhor opção</span>}
                </div>
                <span className="linkprice">{window.brl(l.p)}</span>
                {(l.url && l.url!=="#")
                  ? <a className="gobtn" href={l.url} target="_blank" rel="noopener noreferrer">abrir ↗</a>
                  : <span className="gobtn disabled" title="adicione o link no botão editar">sem link</span>}
              </div>
            ))}
          </div>

          {item.notes && <>
            <div className="section-label" style={{marginTop:22}}>Minhas notas</div>
            <div className="notebox">{item.notes}</div>
          </>}

          <div className="detail-actions">
            <button className={"act primary"+(item.bought?" undo":"")} onClick={markBought}>
              {item.bought ? "desmarcar compra" : "marquei como comprado"}
            </button>
            <button className="act" onClick={()=>onEdit(item)}>editar</button>
            <button className="act danger" onClick={()=>{ if(confirm("Remover este item da lista?")){ store.remove(item.id); onClose(); } }}>remover</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function AddEditForm({ item, store, onClose }){
  const editing = !!item;
  const [f, setF] = React.useState(()=> item ? {
    ...item, imgs: window.imgsOf(item), links: item.links.map(l=>({...l}))
  } : {
    t:"", cat:"eletro", pri:2, min:"", max:"", notes:"", bought:false, imgs:[],
    links:[{s:"",p:"",best:true,url:""}], date:new Date().toISOString().slice(0,10),
  });
  const upd = (k,v)=> setF(s=>({...s,[k]:v}));
  const updLink = (i,k,v)=> setF(s=>({...s, links:s.links.map((l,j)=>j===i?{...l,[k]:v}:l)}));
  const addLink = ()=> setF(s=>({...s, links:[...s.links, {s:"",p:"",best:s.links.length===0,url:""}]}));
  const rmLink = (i)=> setF(s=>({...s, links:s.links.filter((_,j)=>j!==i)}));
  const setBest = (i)=> setF(s=>({...s, links:s.links.map((l,j)=>({...l,best:j===i}))}));

  const save = ()=>{
    if(!f.t.trim()){ alert("Dê um nome pro item."); return; }
    const normUrl = (u)=>{
      u = (u||"").trim();
      if(!u) return "";
      if(!/^https?:\/\//i.test(u)) u = "https://" + u;
      return u;
    };
    const links = f.links.filter(l=>l.s.trim()||l.p||(l.url||"").trim()).map(l=>({ s:l.s.trim()||"Loja", p:Number(l.p)||0, best:!!l.best, url:normUrl(l.url) }));
    if(links.length && !links.some(l=>l.best)) links[0].best = true;
    const prices = links.map(l=>l.p).filter(p=>p>0);
    const min = Number(f.min) || (prices.length?Math.min(...prices):0);
    const max = Number(f.max) || (prices.length?Math.max(...prices):min);
    store.upsert({ ...(editing?{id:f.id}:{}), t:f.t.trim(), cat:f.cat, pri:Number(f.pri), min, max,
      notes:f.notes, bought:f.bought, imgs:f.imgs||[], img:null, links: links.length?links:[{s:"Loja",p:0,best:true,url:""}], date:f.date });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="form-title">{editing ? "Editar desejo" : "Novo desejo"}</h2>
      <div className="form">
        <div className="fld full">
          <span>Fotos <small>(opcional)</small></span>
          <div className="formgallery">
            {(f.imgs||[]).map((im,i)=>(
              <div key={i} className="fg-thumb">
                <img src={im.src} alt="" style={{ objectPosition: window.objPos(im) }} />
                <button type="button" className="gthumb-x" onClick={()=>setF(s=>({...s, imgs:s.imgs.filter((_,j)=>j!==i)}))}>✕</button>
              </div>
            ))}
            <ImageDrop className="formdrop sm" onChange={(im)=>setF(s=>({...s, imgs:[...(s.imgs||[]), im]}))}>
              <span className="formdrop-ph">+ foto</span>
            </ImageDrop>
          </div>
        </div>
        <label className="fld full"><span>O que você quer?</span>
          <input className="inp" value={f.t} onChange={e=>upd("t",e.target.value)} placeholder="Ex: Fone Bluetooth ANC" autoFocus />
        </label>
        <label className="fld"><span>Categoria</span>
          <select className="inp" value={f.cat} onChange={e=>upd("cat",e.target.value)}>
            {Object.entries(window.CATS).map(([k,c])=> <option key={k} value={k}>{c.name}</option>)}
          </select>
        </label>
        <label className="fld"><span>Prioridade</span>
          <select className="inp" value={f.pri} onChange={e=>upd("pri",e.target.value)}>
            {Object.entries(window.PRIOS).map(([k,p])=> <option key={k} value={k}>{p.label}</option>)}
          </select>
        </label>
        <label className="fld"><span>Preço mínimo (R$)</span>
          <input className="inp" type="number" value={f.min} onChange={e=>upd("min",e.target.value)} placeholder="opcional" />
        </label>
        <label className="fld"><span>Preço máximo (R$)</span>
          <input className="inp" type="number" value={f.max} onChange={e=>upd("max",e.target.value)} placeholder="opcional" />
        </label>

        <div className="fld full">
          <span>Links de compra <small>(★ = melhor opção)</small></span>
          <div className="linkedit">
            {f.links.map((l,i)=>(
              <div className="linkedit-row" key={i}>
                <button type="button" className={"starbtn"+(l.best?" on":"")} title="melhor opção" onClick={()=>setBest(i)}>★</button>
                <div className="linkedit-fields">
                  <div className="linkedit-top">
                    <input className="inp" style={{flex:2}} value={l.s} onChange={e=>updLink(i,"s",e.target.value)} placeholder="Loja" />
                    <input className="inp" style={{flex:1,minWidth:80}} type="number" value={l.p} onChange={e=>updLink(i,"p",e.target.value)} placeholder="R$" />
                  </div>
                  <input className="inp" value={l.url} onChange={e=>updLink(i,"url",e.target.value)} placeholder="colar link da loja (opcional)" />
                </div>
                <button type="button" className="rmlink" title="remover loja" onClick={()=>rmLink(i)}>✕</button>
              </div>
            ))}
            <button type="button" className="addlink" onClick={addLink}>+ adicionar loja</button>
          </div>
        </div>

        <label className="fld full"><span>Notas</span>
          <textarea className="inp" rows="2" value={f.notes} onChange={e=>upd("notes",e.target.value)} placeholder="Lembretes, tamanho, cor..."></textarea>
        </label>
      </div>
      <div className="form-actions">
        <button className="act" onClick={onClose}>cancelar</button>
        <button className="act primary" onClick={save}>{editing?"salvar":"adicionar à lista"}</button>
      </div>
    </Modal>
  );
}

function CategoryManager({ store, onClose }){
  const [rows, setRows] = React.useState(()=> Object.entries(store.cats).map(([key,c])=>({ key, name:c.name, color:c.color })));
  const palette = window.CAT_PALETTE;
  const count = (key)=> store.items.filter(i=>i.cat===key).length;
  const upd = (i,patch)=> setRows(rs=> rs.map((r,j)=> j===i?{...r,...patch}:r));
  const add = ()=> setRows(rs=> [...rs, { key:"c"+Date.now().toString(36)+Math.floor(Math.random()*1e3), name:"", color: palette[rs.length % palette.length] }]);
  const del = (i)=>{
    const r = rows[i]; const n = count(r.key);
    if(n>0 && !confirm(`${n} ${n>1?"itens estão":"item está"} em "${r.name||"esta categoria"}". Eles irão para a primeira categoria. Excluir mesmo assim?`)) return;
    setRows(rs=> rs.filter((_,j)=>j!==i));
  };
  const save = ()=>{
    const clean = rows.filter(r=> r.name.trim());
    if(!clean.length){ alert("Mantenha pelo menos uma categoria."); return; }
    const next = {};
    clean.forEach(r=>{ next[r.key] = { name:r.name.trim(), ini:(r.name.trim()[0]||"?").toUpperCase(), color:r.color }; });
    store.setCats(next);
    onClose();
  };
  return (
    <Modal onClose={onClose}>
      <h2 className="form-title">Categorias</h2>
      <p className="cm-hint">Renomeie, escolha a cor, adicione ou remova. Itens de uma categoria removida vão para a primeira da lista.</p>
      <div className="cm-list">
        {rows.map((r,i)=>(
          <div className="cm-row" key={r.key}>
            <span className="cm-badge" style={{ background:r.color }}>{(r.name.trim()[0]||"?").toUpperCase()}</span>
            <div className="cm-fields">
              <input className="inp" value={r.name} placeholder="Nome da categoria" onChange={e=>upd(i,{name:e.target.value})} />
              <div className="cm-swatches">
                {palette.map(col=>(
                  <button key={col} type="button" className={"cm-sw"+(r.color===col?" on":"")} style={{ background:col }}
                    onClick={()=>upd(i,{color:col})} title="cor"></button>
                ))}
              </div>
            </div>
            <button type="button" className="rmlink" title="excluir" onClick={()=>del(i)}>✕</button>
          </div>
        ))}
        <button type="button" className="addlink" onClick={add}>+ adicionar categoria</button>
      </div>
      <div className="form-actions">
        <button className="act" onClick={()=>{ if(confirm("Restaurar as categorias originais?")) { store.resetCats(); onClose(); } }} style={{marginRight:"auto"}}>restaurar padrão</button>
        <button className="act" onClick={onClose}>cancelar</button>
        <button className="act primary" onClick={save}>salvar</button>
      </div>
    </Modal>
  );
}

Object.assign(window, { Modal, ItemDetail, AddEditForm, CategoryManager });
