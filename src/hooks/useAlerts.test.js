import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAlerts } from './useAlerts';
import {
  ALERTS_ENABLED_KEY,
  ALERT_RULES_KEY,
  DEFAULT_THRESHOLD,
  writeAlertsEnabled,
  writeAlertRules,
} from '../utils/alerts';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
  // Reset Notification mock to default 'default' permission state
  global.Notification = class {
    constructor() {}
    static permission = 'default';
    static requestPermission = vi.fn().mockResolvedValue('granted');
  };
});

describe('useAlerts — initial state', () => {
  it('reads alertsEnabled from localStorage (false by default)', () => {
    const { result } = renderHook(() => useAlerts());
    expect(result.current.alertsEnabled).toBe(false);
  });

  it('reads alertsEnabled = true when pre-set in localStorage', () => {
    writeAlertsEnabled(true);
    const { result } = renderHook(() => useAlerts());
    expect(result.current.alertsEnabled).toBe(true);
  });

  it('reads alertRules from localStorage ({} by default)', () => {
    const { result } = renderHook(() => useAlerts());
    expect(result.current.alertRules).toEqual({});
  });

  it('reads alertRules when pre-set in localStorage', () => {
    writeAlertRules({ fightA: { enabled: true, threshold: 10 } });
    const { result } = renderHook(() => useAlerts());
    expect(result.current.alertRules).toEqual({ fightA: { enabled: true, threshold: 10 } });
  });

  it('returns permissionState = default when Notification.permission is default', () => {
    const { result } = renderHook(() => useAlerts());
    expect(result.current.permissionState).toBe('default');
  });

  it('returns permissionState = granted when Notification.permission is granted', () => {
    global.Notification.permission = 'granted';
    const { result } = renderHook(() => useAlerts());
    expect(result.current.permissionState).toBe('granted');
  });

  it('returns permissionState = unsupported when Notification is absent', () => {
    const orig = global.Notification;
    delete global.Notification;
    const { result } = renderHook(() => useAlerts());
    expect(result.current.permissionState).toBe('unsupported');
    global.Notification = orig;
  });
});

describe('useAlerts — toggleAlerts', () => {
  it('flips alertsEnabled from false to true', () => {
    const { result } = renderHook(() => useAlerts());
    act(() => { result.current.toggleAlerts(); });
    expect(result.current.alertsEnabled).toBe(true);
  });

  it('flips alertsEnabled from true to false', () => {
    writeAlertsEnabled(true);
    const { result } = renderHook(() => useAlerts());
    act(() => { result.current.toggleAlerts(); });
    expect(result.current.alertsEnabled).toBe(false);
  });

  it('persists alertsEnabled to localStorage', () => {
    const { result } = renderHook(() => useAlerts());
    act(() => { result.current.toggleAlerts(); });
    expect(localStorage.getItem(ALERTS_ENABLED_KEY)).toBe('true');
  });
});

describe('useAlerts — toggleFightAlert', () => {
  it('enables an alert for a fight not yet in rules', () => {
    const { result } = renderHook(() => useAlerts());
    act(() => { result.current.toggleFightAlert('fightA'); });
    expect(result.current.alertRules['fightA'].enabled).toBe(true);
    expect(result.current.alertRules['fightA'].threshold).toBe(DEFAULT_THRESHOLD);
  });

  it('disables an alert for a fight already enabled', () => {
    writeAlertRules({ fightA: { enabled: true, threshold: 5 } });
    const { result } = renderHook(() => useAlerts());
    act(() => { result.current.toggleFightAlert('fightA'); });
    expect(result.current.alertRules['fightA'].enabled).toBe(false);
  });

  it('preserves existing threshold when toggling', () => {
    writeAlertRules({ fightA: { enabled: false, threshold: 12 } });
    const { result } = renderHook(() => useAlerts());
    act(() => { result.current.toggleFightAlert('fightA'); });
    expect(result.current.alertRules['fightA'].threshold).toBe(12);
  });

  it('persists rules to localStorage', () => {
    const { result } = renderHook(() => useAlerts());
    act(() => { result.current.toggleFightAlert('fightA'); });
    const stored = JSON.parse(localStorage.getItem(ALERT_RULES_KEY));
    expect(stored['fightA'].enabled).toBe(true);
  });
});

describe('useAlerts — setFightThreshold', () => {
  it('updates threshold for an existing rule', () => {
    writeAlertRules({ fightA: { enabled: true, threshold: 5 } });
    const { result } = renderHook(() => useAlerts());
    act(() => { result.current.setFightThreshold('fightA', 15); });
    expect(result.current.alertRules['fightA'].threshold).toBe(15);
  });

  it('creates a rule entry if none exists', () => {
    const { result } = renderHook(() => useAlerts());
    act(() => { result.current.setFightThreshold('fightB', 20); });
    expect(result.current.alertRules['fightB'].threshold).toBe(20);
    expect(result.current.alertRules['fightB'].enabled).toBe(false);
  });
});

describe('useAlerts — requestPermission', () => {
  it('calls Notification.requestPermission and updates permissionState', async () => {
    global.Notification.requestPermission = vi.fn().mockResolvedValue('granted');
    const { result } = renderHook(() => useAlerts());
    await act(async () => { await result.current.requestPermission(); });
    expect(result.current.permissionState).toBe('granted');
  });

  it('is a no-op when Notification is unsupported', async () => {
    const orig = global.Notification;
    delete global.Notification;
    const { result } = renderHook(() => useAlerts());
    await act(async () => { await result.current.requestPermission(); });
    // should not throw
    expect(result.current.permissionState).toBe('unsupported');
    global.Notification = orig;
  });
});

describe('useAlerts — notification firing', () => {
  it('fires a Notification when movement exceeds threshold', () => {
    // Setup: alerts on, permission granted, fight rule enabled, prev line in sessionStorage
    writeAlertsEnabled(true);
    writeAlertRules({ 'islamvsoliveira': { enabled: true, threshold: 5 } });
    sessionStorage.setItem('alerts_prev_lines', JSON.stringify({
      islamvsoliveira: { f1_ml: '-150', f2_ml: '+130' },
    }));

    global.Notification.permission = 'granted';
    const notifSpy = vi.fn();
    global.Notification = class {
      constructor(title, opts) { notifSpy(title, opts); }
      static permission = 'granted';
      static requestPermission = vi.fn();
    };

    const oddsData = [{
      fightKey:  'islamvsoliveira',
      fighter1:  'Islam Makhachev',
      fighter2:  'Charles Oliveira',
      sportsbook: { f1_ml: '-200', f2_ml: '+170', source: 'DraftKings' },
    }];

    renderHook(() => useAlerts(oddsData));
    expect(notifSpy).toHaveBeenCalledOnce();
    expect(notifSpy.mock.calls[0][0]).toBe('AUDWIHR — Line Movement');
    expect(notifSpy.mock.calls[0][1].body).toContain('Makhachev');
  });

  it('does NOT fire when alertsEnabled is false', () => {
    writeAlertsEnabled(false);
    writeAlertRules({ fightA: { enabled: true, threshold: 5 } });
    sessionStorage.setItem('alerts_prev_lines', JSON.stringify({
      fightA: { f1_ml: '-150', f2_ml: '+130' },
    }));
    global.Notification.permission = 'granted';
    const notifSpy = vi.fn();
    global.Notification = class {
      constructor() { notifSpy(); }
      static permission = 'granted';
      static requestPermission = vi.fn();
    };

    const oddsData = [{ fightKey: 'fightA', fighter1: 'A', fighter2: 'B', sportsbook: { f1_ml: '-200', f2_ml: '+170', source: 'x' } }];
    renderHook(() => useAlerts(oddsData));
    expect(notifSpy).not.toHaveBeenCalled();
  });

  it('does NOT fire when permission is not granted', () => {
    writeAlertsEnabled(true);
    writeAlertRules({ fightA: { enabled: true, threshold: 5 } });
    sessionStorage.setItem('alerts_prev_lines', JSON.stringify({
      fightA: { f1_ml: '-150', f2_ml: '+130' },
    }));
    const notifSpy = vi.fn();
    global.Notification = class {
      constructor() { notifSpy(); }
      static permission = 'denied'; // <-- denied
      static requestPermission = vi.fn();
    };

    const oddsData = [{ fightKey: 'fightA', fighter1: 'A', fighter2: 'B', sportsbook: { f1_ml: '-200', f2_ml: '+170', source: 'x' } }];
    renderHook(() => useAlerts(oddsData));
    expect(notifSpy).not.toHaveBeenCalled();
  });

  it('does NOT fire when oddsData is null', () => {
    writeAlertsEnabled(true);
    global.Notification.permission = 'granted';
    const notifSpy = vi.fn();
    global.Notification = class {
      constructor() { notifSpy(); }
      static permission = 'granted';
      static requestPermission = vi.fn();
    };
    renderHook(() => useAlerts(null));
    expect(notifSpy).not.toHaveBeenCalled();
  });
});
