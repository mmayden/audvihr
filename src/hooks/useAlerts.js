import { useState, useEffect, useRef, useCallback } from 'react';
import {
  readAlertsEnabled, writeAlertsEnabled,
  readAlertRules,    writeAlertRules,
  readPrevLines,     writePrevLines,
  detectMovements,   DEFAULT_THRESHOLD,
} from '../utils/alerts';

/**
 * useAlerts — line-movement alert hook.
 *
 * Watches live sportsbook odds data; fires browser Notification API alerts when a
 * fight's F1 moneyline moves at or beyond the per-fight configured threshold.
 *
 * Silent degradation in all of:
 *   - Notification API absent (server-side render, old browser)
 *   - User has denied notification permission
 *   - `oddsData` is null / empty (API keys absent, quota exceeded, offline)
 *   - `alertsEnabled` is false (global toggle off)
 *   - No per-fight rule has enabled:true
 *
 * Pass `oddsData` from `useOdds` to activate movement detection.
 * Safe to call without `oddsData` (settings-only usage in MenuScreen).
 *
 * @param {Array|null} [oddsData=null] - sportsbook array from useOdds
 * @returns {{
 *   alertsEnabled:    boolean,
 *   toggleAlerts:     () => void,
 *   alertRules:       Object,
 *   toggleFightAlert: (fightKey: string) => void,
 *   setFightThreshold:(fightKey: string, threshold: number) => void,
 *   permissionState:  'granted'|'denied'|'default'|'unsupported',
 *   requestPermission:() => Promise<void>,
 * }}
 */
export function useAlerts(oddsData = null) {
  const [alertsEnabled,   setAlertsEnabled]   = useState(() => readAlertsEnabled());
  const [alertRules,      setAlertRules]       = useState(() => readAlertRules());
  const [permissionState, setPermissionState]  = useState(() => {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission;
  });

  // Ref holds the previous-lines snapshot — updated after each odds comparison.
  const prevLinesRef = useRef(readPrevLines());

  // Persist global flag whenever it changes.
  useEffect(() => { writeAlertsEnabled(alertsEnabled); }, [alertsEnabled]);

  // Persist per-fight rules whenever they change.
  useEffect(() => { writeAlertRules(alertRules); }, [alertRules]);

  /** Request browser notification permission (call on explicit user action). */
  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermissionState(result);
  }, []);

  /** Toggle the global alerts on/off flag. */
  const toggleAlerts = useCallback(() => {
    setAlertsEnabled((v) => !v);
  }, []);

  /**
   * Toggle the alert rule for a specific fight.
   * First enable sets threshold to DEFAULT_THRESHOLD.
   * @param {string} fightKey
   */
  const toggleFightAlert = useCallback((fightKey) => {
    setAlertRules((prev) => {
      const existing = prev[fightKey] || {};
      return {
        ...prev,
        [fightKey]: { threshold: DEFAULT_THRESHOLD, ...existing, enabled: !existing.enabled },
      };
    });
  }, []);

  /**
   * Update the movement threshold for a specific fight.
   * @param {string} fightKey
   * @param {number} threshold - ML points (positive integer)
   */
  const setFightThreshold = useCallback((fightKey, threshold) => {
    setAlertRules((prev) => {
      const existing = prev[fightKey] || { enabled: false };
      return { ...prev, [fightKey]: { ...existing, threshold } };
    });
  }, []);

  // Detect movement and fire notifications whenever oddsData updates.
  useEffect(() => {
    if (!alertsEnabled) return;
    if (!oddsData || oddsData.length === 0) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    const prev = prevLinesRef.current;
    const movements = detectMovements(oddsData, prev, alertRules);

    movements.forEach((mv) => {
      // textContent only — never interpolate HTML.
      const title = 'AUDWIHR — Line Movement';
      const body  = `${mv.fighter1.split(' ').pop()} vs ${mv.fighter2.split(' ').pop()}: `
        + `${mv.curF1ml} (was ${mv.prevF1ml}) — ${mv.direction} ${mv.delta}pts`;
      new Notification(title, { body });
    });

    // Advance the snapshot regardless of whether alerts fired.
    const updated = { ...prev };
    oddsData.forEach((f) => {
      if (f && f.fightKey && f.sportsbook) {
        updated[f.fightKey] = { f1_ml: f.sportsbook.f1_ml, f2_ml: f.sportsbook.f2_ml };
      }
    });
    prevLinesRef.current = updated;
    writePrevLines(updated);
  }, [oddsData, alertsEnabled, alertRules]);

  return {
    alertsEnabled,
    toggleAlerts,
    alertRules,
    toggleFightAlert,
    setFightThreshold,
    permissionState,
    requestPermission,
  };
}
