'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export enum ThemeOption {
  light = 'light',
  dark = 'dark',
  auto = 'auto',
}

interface SettingsContextProps {
  // Theme state
  activeTheme: ThemeOption;
  setActiveTheme: (theme: ThemeOption) => void;
  // Accent color state
  accentColor: string;
  setAccentColor: (color: string) => void;
  // Text size state
  textSize: number;
  setTextSize: (size: number) => void;
  // Brightness state
  brightness: number;
  setBrightness: (brightness: number) => void;
  // Other toggle states
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
  autoPlay: boolean;
  setAutoPlay: (v: boolean) => void;
  highQualityPhoto: boolean;
  setHighQualityPhoto: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTheme, setActiveThemeState] = useState<ThemeOption>(ThemeOption.auto);
  const [accentColor, setAccentColorState] = useState<string>('blue');
  const [textSize, setTextSizeState] = useState<number>(20);
  const [brightness, setBrightnessState] = useState<number>(100);
  
  const [reduceMotion, setReduceMotionState] = useState<boolean>(false);
  const [autoPlay, setAutoPlayState] = useState<boolean>(true);
  const [highQualityPhoto, setHighQualityPhotoState] = useState<boolean>(true);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as ThemeOption | null;
    const savedColor = localStorage.getItem('accentColor');
    const savedTextSize = localStorage.getItem('textSize');
    const savedBrightness = localStorage.getItem('brightness');
    const savedReduceMotion = localStorage.getItem('reduceMotion');
    const savedAutoPlay = localStorage.getItem('autoPlay');
    const savedHighQuality = localStorage.getItem('highQualityPhoto');

    if (savedTheme && Object.values(ThemeOption).includes(savedTheme)) setActiveThemeState(savedTheme);
    if (savedColor) setAccentColorState(savedColor);
    if (savedTextSize) setTextSizeState(Number(savedTextSize));
    if (savedBrightness) setBrightnessState(Number(savedBrightness));
    if (savedReduceMotion !== null) setReduceMotionState(savedReduceMotion === 'true');
    if (savedAutoPlay !== null) setAutoPlayState(savedAutoPlay === 'true');
    if (savedHighQuality !== null) setHighQualityPhotoState(savedHighQuality === 'true');
  }, []);

  const applyTheme = (theme: ThemeOption) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === ThemeOption.auto) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    applyTheme(activeTheme);
  }, [activeTheme, mounted]);

  // Handle system theme changes if set to auto
  useEffect(() => {
    if (!mounted) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (activeTheme === ThemeOption.auto) {
        applyTheme(ThemeOption.auto);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [activeTheme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    root.style.setProperty('--app-accent-color', accentColor);
    root.style.setProperty('--app-text-size', `${textSize}px`);
    // Brightness could be applied using a backdrop filter or generic filter
    root.style.setProperty('--app-brightness', `${brightness}%`);
    root.style.filter = `brightness(${brightness}%)`;
    
  }, [accentColor, textSize, brightness, mounted]);

  // Setters with localStorage persistence
  const setActiveTheme = (theme: ThemeOption) => {
    setActiveThemeState(theme);
    localStorage.setItem('theme', theme);
  };
  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    localStorage.setItem('accentColor', color);
  };
  const setTextSize = (val: number) => {
    setTextSizeState(val);
    localStorage.setItem('textSize', val.toString());
  };
  const setBrightness = (val: number) => {
    setBrightnessState(val);
    localStorage.setItem('brightness', val.toString());
  };
  const setReduceMotion = (val: boolean) => {
    setReduceMotionState(val);
    localStorage.setItem('reduceMotion', val.toString());
  };
  const setAutoPlay = (val: boolean) => {
    setAutoPlayState(val);
    localStorage.setItem('autoPlay', val.toString());
  };
  const setHighQualityPhoto = (val: boolean) => {
    setHighQualityPhotoState(val);
    localStorage.setItem('highQualityPhoto', val.toString());
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        activeTheme, setActiveTheme,
        accentColor, setAccentColor,
        textSize, setTextSize,
        brightness, setBrightness,
        reduceMotion, setReduceMotion,
        autoPlay, setAutoPlay,
        highQualityPhoto, setHighQualityPhoto
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
