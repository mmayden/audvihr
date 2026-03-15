/**
 * ComingSoon — placeholder screen rendered for features not yet implemented.
 * @param {string} label - the feature name displayed in the topbar and heading
 * @param {function} onBack - callback invoked when the back button is clicked
 */
export function ComingSoon({label,onBack}) {
  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-logo">AUDWIHR</span><span className="topbar-sep">/</span>
        <span className="topbar-section">{label}</span>
        <div className="topbar-right"><button className="topbar-back" onClick={onBack}>← MENU</button></div>
      </div>
      <div className="coming-soon">
        <div style={{fontFamily:'var(--mono)',fontSize:10,letterSpacing:'.15em',color:'var(--text-dim)'}}>COMING IN FUTURE PHASE</div>
        <div style={{fontSize:20,fontWeight:700,color:'var(--text-bright)',letterSpacing:'.05em'}}>{label}</div>
        <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--text-dim)',marginTop:8}}>See the project outline for the full roadmap.</div>
      </div>
    </div>
  );
}
