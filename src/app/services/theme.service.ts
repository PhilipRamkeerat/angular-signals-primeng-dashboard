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
  private readonly themeStorageKey = 'theme-mode';
  
  private readonly _themeMode = signal<ThemeMode>(this.getInitialTheme());
  public readonly themeMode = this._themeMode.asReadonly();
  
  constructor() {
    effect(() => this.applyTheme(this._themeMode()));
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
  
  private getInitialTheme(): ThemeMode {
    const savedTheme = localStorage.getItem(this.themeStorageKey);
    if (this.isValidThemeMode(savedTheme)) {
      return savedTheme;
    }
    
    return this.getSystemThemePreference();
  }
  
  private isValidThemeMode(theme: string | null): theme is ThemeMode {
    return theme === 'light' || theme === 'dark';
  }
  
  private getSystemThemePreference(): ThemeMode {
    const matchesDark = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches;
    return matchesDark ? 'dark' : 'light';
  }
  
  private applyTheme(mode: ThemeMode): void {
    this.updatePrimeNGTheme(mode);
    this.updateDocumentClasses(mode);
    this.saveThemePreference(mode);
  }
  
  private updatePrimeNGTheme(mode: ThemeMode): void {
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
  }
  
  private updateDocumentClasses(mode: ThemeMode): void {
    const htmlElement = this.document.documentElement;
    const isDark = mode === 'dark';
    
    htmlElement.classList.toggle('dark', isDark);
    htmlElement.classList.toggle('light', !isDark);
  }
  
  private saveThemePreference(mode: ThemeMode): void {
    localStorage.setItem(this.themeStorageKey, mode);
  }
} 