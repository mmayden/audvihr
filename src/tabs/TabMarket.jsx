import { useLocalStorage } from '../hooks/useLocalStorage';
import { mlToImplied, lineMovement } from '../utils/odds';

/**
 * TabMarket — renders the Market tab for a fighter profile.
 * Provides editable fields for moneyline (open/current), method odds,
 * public bet percentage, and free-text analysis notes. All data is
 * persisted to localStorage keyed by fighter id.
 * @param {object} f - fighter object from FIGHTERS
 */
export function TabMarket({f}) {
  const [data,setData] = useLocalStorage(`mkt_${f.id}`, {ml_open:'',ml_current:'',odds_ko:'',odds_sub:'',odds_dec:'',public_pct:'',notes:''});
  const upd = (k,v) => setData(p=>({...p,[k]:v}));
  const mv = lineMovement(data.ml_open, data.ml_current);
  return <div className="anim-fade">
    <div className="sec-label">MONEYLINE</div>
    <div className="market-grid">
      {[{k:'ml_open',l:'OPENING LINE'},{k:'ml_current',l:'CURRENT LINE'}].map(({k,l})=>(
        <div className="market-card" key={k}>
          <div className="mc-label">{l}</div>
          <input className="mc-input" placeholder="-150" value={data[k]} onChange={e=>upd(k,e.target.value)}/>
          {data[k] && <div className="mc-implied">Implied: <span>{mlToImplied(data[k])}%</span></div>}
        </div>
      ))}
    </div>
    {mv && <div style={{padding:'8px 12px',background:'var(--surface)',marginBottom:16,fontFamily:'var(--mono)',fontSize:11,color:mv.dir==='up'?'var(--green)':'var(--red)'}}>▲ LINE MOVEMENT: {mv.label}</div>}
    <div className="sec-label">METHOD ODDS</div>
    <div className="market-grid">
      {[{k:'odds_ko',l:'WIN BY KO/TKO'},{k:'odds_sub',l:'WIN BY SUB'},{k:'odds_dec',l:'WIN BY DEC'}].map(({k,l})=>(
        <div className="market-card" key={k}>
          <div className="mc-label">{l}</div>
          <input className="mc-input" placeholder="+300" value={data[k]} onChange={e=>upd(k,e.target.value)}/>
          {data[k] && <div className="mc-implied">Implied: <span>{mlToImplied(data[k])}%</span></div>}
        </div>
      ))}
    </div>
    <div className="sec-label">PUBLIC MONEY %</div>
    <div className="market-grid" style={{gridTemplateColumns:'1fr'}}>
      <div className="market-card">
        <div className="mc-label">PUBLIC BET % (if available from tracker)</div>
        <input className="mc-input" style={{fontSize:18}} placeholder="65" value={data.public_pct} onChange={e=>upd('public_pct',e.target.value)}/>
        {data.public_pct && data.ml_current && (
          <div className="mc-implied" style={{marginTop:6}}>
            {parseInt(data.public_pct)>70
              ? <span style={{color:'var(--orange)'}}>⚠ Heavy public action — potential price inflation</span>
              : <span style={{color:'var(--green)'}}>Public distribution within normal range</span>}
          </div>
        )}
      </div>
    </div>
    <div className="sec-label">ANALYSIS NOTES</div>
    <textarea className="notes-area" placeholder="Line movement story, sharp action signals, your edge thesis for this fight..." value={data.notes} onChange={e=>upd('notes',e.target.value)}/>
  </div>;
}
