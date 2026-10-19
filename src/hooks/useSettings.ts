import { useState, useEffect } from 'react';

const SETTINGS_KEY = 'a5_settings';

export interface AppSettings {
  fontSize: 'sm' | 'md' | 'lg';
  fontFamily: 'serif' | 'sans';
  pageTone: 'cream' | 'white' | 'sepia';
  showRuling: boolean;
  showMargin: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 'md',
  fontFamily: 'serif',
  pageTone: 'cream',
  showRuling: true,
  showMargin: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting };
}
