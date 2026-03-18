import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * useTheme — manages the application colour-scheme toggle.
 * Persists the user's preference ('light' | 'dark' | 'system') to localStorage.
 * Applies the `data-theme` attribute on `<html>` so CSS variables can switch.
 * When theme is 'system' the attribute is removed and `prefers-color-scheme`
 * takes over via the CSS media query.
 * @returns {{ theme: string, toggle: function, label: string }}
 */
export const useTheme = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'system');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));
  const label  = theme === 'light' ? 'MONOLITH' : 'ARENA';

  return { theme, toggle, label };
};
