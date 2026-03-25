import { useState } from 'react';
import { useAlerts } from '../hooks/useAlerts';

/** Static menu item definitions — update badge/active when a screen is added or activated. */
const MENU_ITEMS = [
  { id: 'fighters', label: 'FIGHTERS',       badge: 'ACTIVE', active: true },
  { id: 'compare',  label: 'COMPARE',        badge: 'ACTIVE', active: true },
  { id: 'calendar', label: 'FIGHT CALENDAR', badge: 'ACTIVE', active: true },
  { id: 'markets',  label: 'MARKETS',        badge: 'ACTIVE', active: true },
  { id: 'news',     label: 'FIGHTER NEWS',   badge: 'ACTIVE', active: true },
];

/** Human-readable label for Notification permission state. */
const PERM_LABEL = {
  granted:     'GRANTED',
  denied:      'DENIED',
  default:     'NOT ASKED',
  unsupported: 'NOT SUPPORTED',
};

/**
 * MenuScreen — renders the main navigation menu with an alert settings panel.
 *
 * @param {function} onSelect - callback invoked with the section id string when a menu item is clicked
 */
export const MenuScreen = ({ onSelect }) => {
  const [showSettings, setShowSettings] = useState(false);
  const { alertsEnabled, toggleAlerts, permissionState, requestPermission } = useAlerts();

  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-logo">AUDWIHR // MMA TRADER</span>
        <div className="topbar-right">
          <button
            className={`topbar-back${showSettings ? ' active' : ''}`}
            onClick={() => setShowSettings((v) => !v)}
            aria-label="Toggle alert settings"
          >
            ⚙ ALERTS
          </button>
          <span className="topbar-version-badge">v0.18.4-dev</span>
        </div>
      </div>

      {/* Alert settings panel */}
      {showSettings && (
        <div className="alert-settings-panel">
          <div className="sec-label sec-label--mb-8">LINE MOVEMENT ALERTS</div>

          <div className="alert-settings-row">
            <span className="alert-settings-label">GLOBAL ALERTS</span>
            <button
              className={`alert-settings-toggle${alertsEnabled ? ' on' : ''}`}
              onClick={toggleAlerts}
            >
              {alertsEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="alert-settings-row">
            <span className="alert-settings-label">PERMISSION</span>
            <span className={`alert-permission-badge alert-perm--${permissionState}`}>
              {PERM_LABEL[permissionState] || permissionState.toUpperCase()}
            </span>
            {permissionState === 'default' && (
              <button className="alert-settings-request-btn" onClick={requestPermission}>
                REQUEST
              </button>
            )}
          </div>

          <div className="alert-settings-hint">
            Per-fight alert thresholds are configured via the 🔔 bell icon on each market card.
            Enable global alerts and grant permission first.
          </div>
        </div>
      )}

      <div className="menu-screen">
        <div className="menu-wordmark">AUDWIHR</div>
        <div className="menu-sub">MMA Prediction Market Trader</div>
        <div className="menu-list">
          {MENU_ITEMS.map((item,i)=>(
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
};
