import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly primeng = inject(PrimeNG);
  
  // Signal for current theme mode
  private readonly _themeMode = signal<ThemeMode>(this.getInitialTheme());
  
  // Public readonly signal
  public readonly themeMode = this._themeMode.asReadonly();
  
  constructor() {
    // Effect to apply theme changes
    effect(() => {
      this.applyTheme(this._themeMode());
    });
  }
  
  private getInitialTheme(): ThemeMode {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme-mode');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    // Check system preference
    if (this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  }
  
  private applyTheme(mode: ThemeMode): void {
    // Apply theme using the new PrimeNG v19 approach
    this.primeng.theme.set({
      preset: Lara,
      options: {
        darkModeSelector: mode === 'dark' ? '.dark' : false,
        cssLayer: {
          name: 'primeng',
          order: 'tailwind-base, primeng, tailwind-utilities'  
        }
      }
    });
    
    // Update document classes
    const htmlElement = this.document.documentElement;
    if (mode === 'dark') {
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
    } else {
      htmlElement.classList.add('light');
      htmlElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('theme-mode', mode);
    
    console.log(`Theme switched to ${mode} mode`);
  }
  
  public toggleTheme(): void {
    const currentMode = this._themeMode();
    this._themeMode.set(currentMode === 'light' ? 'dark' : 'light');
  }
  
  public setTheme(mode: ThemeMode): void {
    this._themeMode.set(mode);
  }
  
  public isDarkMode(): boolean {
    return this._themeMode() === 'dark';
  }
  
  public isLightMode(): boolean {
    return this._themeMode() === 'light';
  }
} 