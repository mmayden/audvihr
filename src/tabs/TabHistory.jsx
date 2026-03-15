/**
 * TabHistory — renders the History tab for a fighter profile.
 * Displays a chronological fight log table for the last N fights.
 * @param {object} fighter - fighter object from FIGHTERS
 */
export const TabHistory = ({ fighter }) => {
  return <div className="anim-fade">
    <div className="sec-label">FIGHT LOG — LAST {fighter.history.length} FIGHTS</div>
    <div className="fight-log">
      <div className="fight-log-header"><span>RES</span><span>OPPONENT</span><span>METHOD</span><span>ROUND</span><span>YEAR</span><span>EVENT</span></div>
      {fighter.history.map((h,i)=>(
        <div className="fight-entry" key={i}>
          <span className={`fe-result ${h.result}`}>{h.result}</span>
          <span style={{fontWeight:500,color:'var(--text)'}}>{h.opponent}</span>
          <span className="fe-dim">{h.method}</span>
          <span className="fe-dim">R{h.round}</span>
          <span className="fe-dim">{h.year}</span>
          <span className="fe-dim">{h.event}</span>
        </div>
      ))}
    </div>
  </div>;
};
