import { useState, useEffect } from 'react';

/**
 * useLocalStorage — persists state to localStorage with JSON serialisation.
 * Falls back to `init` if the key is missing or the stored value is unparseable.
 * @param {string} key - localStorage key
 * @param {*} init - default value if key is absent or parse fails
 */
export function useLocalStorage(key, init) {
  const [v,setV] = useState(()=>{ try{const s=localStorage.getItem(key);return s?JSON.parse(s):init;}catch{return init;} });
  useEffect(()=>{ try{localStorage.setItem(key,JSON.stringify(v));}catch{ /* quota exceeded or private browsing */ } },[key,v]);
  return [v,setV];
}
