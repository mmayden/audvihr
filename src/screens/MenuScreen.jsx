/**
 * MenuScreen — renders the main navigation menu.
 * Displays a list of app sections with activity badges.
 * @param {function} onSelect - callback invoked with the section id string when a menu item is clicked
 */
export function MenuScreen({onSelect}) {
  const items=[
    {id:'fighters',label:'FIGHTERS',      badge:'ACTIVE', active:true},
    {id:'compare', label:'COMPARE',       badge:'ACTIVE', active:true},
    {id:'calendar',label:'FIGHT CALENDAR',badge:'ACTIVE', active:true},
    {id:'markets', label:'MARKETS',       badge:'ACTIVE', active:true},
    {id:'news',    label:'FIGHTER NEWS',  badge:'ACTIVE', active:true},
  ];
  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-logo">AUDWIHR // MMA TRADER</span>
        <div className="topbar-right"><span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--text-dim)',letterSpacing:'.08em'}}>v0.5.0 — MOCK DATA</span></div>
      </div>
      <div className="menu-screen">
        <div className="menu-wordmark">AUDWIHR</div>
        <div className="menu-sub">MMA Prediction Market Trader</div>
        <div className="menu-list">
          {items.map((item,i)=>(
            <div key={item.id} className="menu-item" onClick={()=>onSelect(item.id)}>
              <span className="menu-item-num">0{i+1}</span>
              <span className="menu-item-label">{item.label}</span>
              <span className={`menu-item-badge ${item.active?'active':''}`}>{item.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
