import { useState, useEffect, useMemo } from 'react';
import { DEFAULT_CATS, SEED, PRIOS, avgPrice } from '../lib/utils';

const STORE_KEY = "wishlist-hifi-v1";
const META_KEY  = "wishlist-hifi-meta-v1";
const CAT_KEY   = "wishlist-hifi-cats-v1";

export function useStore(){
  const [cats, setCatsState] = useState(()=>{
    try{ const raw=localStorage.getItem(CAT_KEY); if(raw){ const p=JSON.parse(raw); if(p&&Object.keys(p).length) return p; } }catch(e){}
    return DEFAULT_CATS;
  });

  const [items, setItems] = useState(()=>{
    let arr; try{ const raw=localStorage.getItem(STORE_KEY); if(raw) arr=JSON.parse(raw); }catch(e){}
    if(!Array.isArray(arr)) arr=SEED;
    const fallback=Object.keys(DEFAULT_CATS)[0]||"casa";
    return arr.map(it=> cats[it.cat] ? it : ({ ...it, cat:fallback, pri:it.cat==="reposicao"?0:it.pri }));
  });

  const [meta, setMetaState] = useState(()=>{
    const v=localStorage.getItem(META_KEY); return v ? Number(v) : 0;
  });

  useEffect(()=>{ try{ localStorage.setItem(STORE_KEY, JSON.stringify(items)); }catch(e){} }, [items]);
  useEffect(()=>{ try{ localStorage.setItem(META_KEY, String(meta)); }catch(e){} }, [meta]);
  useEffect(()=>{ try{ localStorage.setItem(CAT_KEY, JSON.stringify(cats)); }catch(e){} }, [cats]);

  return useMemo(()=>({
    items, meta, cats,
    setMeta(v){ setMetaState(Math.max(0, Number(v)||0)); },
    setCats(next){
      const removed=Object.keys(cats).filter(k=>!(k in next));
      const fallback=Object.keys(next)[0]||"casa";
      if(removed.length){ setItems(prev=>prev.map(it=> removed.includes(it.cat)?{...it,cat:fallback}:it)); }
      setCatsState(next);
    },
    resetCats(){ setCatsState(DEFAULT_CATS); },
    upsert(it){
      setItems(prev=>{
        if(it.id&&prev.some(p=>p.id===it.id)) return prev.map(p=>p.id===it.id?{...p,...it}:p);
        const id=Math.max(0,...prev.map(p=>p.id))+1;
        return [{...it,id,date:it.date||new Date().toISOString().slice(0,10)},...prev];
      });
    },
    remove(id){ setItems(prev=>prev.filter(p=>p.id!==id)); },
    toggleBought(id){ setItems(prev=>prev.map(p=>p.id===id?{...p,bought:!p.bought}:p)); },
    setBest(id,idx){ setItems(prev=>prev.map(p=>p.id!==id?p:{...p,links:p.links.map((l,i)=>({...l,best:i===idx}))})); },
    reorderSubset(shownIds){
      setItems(prev=>{
        const shown=new Set(shownIds);
        const map=Object.fromEntries(prev.map(p=>[p.id,p]));
        let q=0;
        return prev.map(p=> shown.has(p.id)?map[shownIds[q++]]:p);
      });
    },
    reset(){ setItems(SEED); },
    replaceAll(arr){ if(Array.isArray(arr)) setItems(arr); },
  }), [items, meta, cats]);
}
