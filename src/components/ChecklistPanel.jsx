import { useMemo, useCallback, Fragment } from 'react';
import { CHECKLIST } from '../constants/checklist';
import { useLocalStorage } from '../hooks/useLocalStorage';

/**
 * ChecklistPanel — renders the 17-item trade checklist with per-matchup localStorage
 * persistence, a progress bar, and a reset button.
 * @param {string} storageKey - unique key suffix used to namespace localStorage (e.g. '1_2')
 */
export const ChecklistPanel = ({storageKey}) => {
  const init = useMemo(()=>Object.fromEntries(CHECKLIST.map(i=>[i.id,false])),[]);
  const [checked, setChecked] = useLocalStorage('cl_' + storageKey, init);
  const done = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const toggle = useCallback(id => setChecked(p => ({...p, [id]: !p[id]})), [setChecked]);
  const reset = useCallback(() => setChecked(Object.fromEntries(CHECKLIST.map(i => [i.id, false]))), [setChecked]);
  const cats = useMemo(() => [...new Set(CHECKLIST.map(i => i.cat))], []);
  return (
    <>
      <div className="cl-header"><span>TRADE CHECKLIST</span><button className="cl-reset" onClick={reset}>RESET</button></div>
      <div className="cl-progress">
        <div className="cl-prog-label"><span>PROGRESS</span><span>{done}/{CHECKLIST.length}</span></div>
        <div className="cl-prog-track"><div className="cl-prog-fill" style={{width:`${(done/CHECKLIST.length)*100}%`}}/></div>
      </div>
      <div className="cl-scroll">
        {cats.map(cat=>{
          const items=CHECKLIST.filter(i=>i.cat===cat);
          return <Fragment key={cat}>
            <div className="cl-cat-label" style={{color:items[0].cc}}>{cat}</div>
            {items.map(item=>(
              <div className="cl-item" key={item.id} onClick={()=>toggle(item.id)} role="checkbox" aria-checked={!!checked[item.id]} aria-label={item.text}>
                <div className={`cl-box ${checked[item.id]?'checked':''}`}>{checked[item.id]?'✓':''}</div>
                <div>
                  <div className={`cl-text ${checked[item.id]?'checked':''}`}>{item.text}</div>
                  <div className="cl-sub">{item.sub}</div>
                </div>
              </div>
            ))}
          </Fragment>;
        })}
      </div>
    </>
  );
}
