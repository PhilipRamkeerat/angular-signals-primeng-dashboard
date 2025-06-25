import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Widget {
  id: string;
  type: 'weather' | 'chart' | 'tasks' | 'stats';
  title: string;
  position: { row: number; col: number };
  size: { width: number; height: number };
}

export interface WidgetLayout {
  userId: string;
  widgets: Widget[];
  lastUpdated: number;
  version: string;
}

@Injectable({
  providedIn: 'root'
})
export class WidgetStorageService {
  private readonly STORAGE_KEY = 'dashboard_widget_layout';
  private readonly STORAGE_VERSION = '1.0.0';
  private readonly DEFAULT_WIDGETS: Widget[] = [
    {
      id: 'weather-1',
      type: 'weather',
      title: 'Weather',
      position: { row: 0, col: 0 },
      size: { width: 1, height: 1 }
    },
    {
      id: 'chart-1',
      type: 'chart',
      title: 'Analytics',
      position: { row: 0, col: 1 },
      size: { width: 1, height: 1 }
    },
    {
      id: 'tasks-1',
      type: 'tasks',
      title: 'Tasks',
      position: { row: 1, col: 0 },
      size: { width: 1, height: 1 }
    },
    {
      id: 'stats-1',
      type: 'stats',
      title: 'Quick Stats',
      position: { row: 1, col: 1 },
      size: { width: 1, height: 1 }
    }
  ];

  private widgetsSubject = new BehaviorSubject<Widget[]>(this.DEFAULT_WIDGETS);
  public widgets$ = this.widgetsSubject.asObservable();

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    // Check if localStorage is available
    if (!this.isLocalStorageAvailable()) {
      console.warn('Local storage is not available. Widget positions will not be persisted.');
      return;
    }

    // Load existing layout if available
    this.loadWidgetLayout();
  }

  /**
   * Check if localStorage is available
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get the current widget layout for a specific user
   */
  getWidgetLayout(userId: string): Widget[] {
    if (!this.isLocalStorageAvailable()) {
      return [...this.DEFAULT_WIDGETS];
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return [...this.DEFAULT_WIDGETS];
      }

      const layout: WidgetLayout = JSON.parse(stored);
      
      // Validate the stored data
      if (!this.isValidLayout(layout)) {
        console.warn('Invalid widget layout found in storage. Using default layout.');
        return [...this.DEFAULT_WIDGETS];
      }

      // Check if the layout belongs to the current user
      if (layout.userId !== userId) {
        return [...this.DEFAULT_WIDGETS];
      }

      // Check version compatibility
      if (layout.version !== this.STORAGE_VERSION) {
        console.warn('Widget layout version mismatch. Using default layout.');
        return [...this.DEFAULT_WIDGETS];
      }

      return layout.widgets;
    } catch (error) {
      console.error('Error loading widget layout from localStorage:', error);
      return [...this.DEFAULT_WIDGETS];
    }
  }

  /**
   * Save the widget layout for a specific user
   */
  saveWidgetLayout(userId: string, widgets: Widget[]): boolean {
    if (!this.isLocalStorageAvailable()) {
      console.warn('Cannot save widget layout: localStorage is not available.');
      return false;
    }

    try {
      const layout: WidgetLayout = {
        userId,
        widgets: [...widgets],
        lastUpdated: Date.now(),
        version: this.STORAGE_VERSION
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(layout));
      this.widgetsSubject.next([...widgets]);
      
      console.log('Widget layout saved successfully for user:', userId);
      return true;
    } catch (error) {
      console.error('Error saving widget layout to localStorage:', error);
      return false;
    }
  }

  /**
   * Reset widget layout to default for a specific user
   */
  resetWidgetLayout(userId: string): Widget[] {
    if (this.isLocalStorageAvailable()) {
      try {
        // Save default layout to localStorage
        this.saveWidgetLayout(userId, this.DEFAULT_WIDGETS);
      } catch (error) {
        console.error('Error resetting widget layout:', error);
      }
    }
    
    this.widgetsSubject.next([...this.DEFAULT_WIDGETS]);
    return [...this.DEFAULT_WIDGETS];
  }

  /**
   * Clear all stored widget layouts (useful for debugging or user data cleanup)
   */
  clearAllLayouts(): void {
    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('All widget layouts cleared from localStorage.');
      } catch (error) {
        console.error('Error clearing widget layouts:', error);
      }
    }
    this.widgetsSubject.next([...this.DEFAULT_WIDGETS]);
  }

  /**
   * Get the last updated timestamp for the current layout
   */
  getLastUpdated(userId: string): number | null {
    if (!this.isLocalStorageAvailable()) {
      return null;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const layout: WidgetLayout = JSON.parse(stored);
      if (layout.userId === userId && this.isValidLayout(layout)) {
        return layout.lastUpdated;
      }
    } catch (error) {
      console.error('Error getting last updated timestamp:', error);
    }

    return null;
  }

  /**
   * Load widget layout on service initialization
   */
  private loadWidgetLayout(): void {
    // This will be called when a user logs in
    // For now, we'll just initialize with default widgets
    this.widgetsSubject.next([...this.DEFAULT_WIDGETS]);
  }

  /**
   * Validate the structure of a widget layout
   */
  private isValidLayout(layout: any): layout is WidgetLayout {
    if (!layout || typeof layout !== 'object') {
      return false;
    }

    if (
      typeof layout.userId !== 'string' ||
      typeof layout.lastUpdated !== 'number' ||
      typeof layout.version !== 'string' ||
      !Array.isArray(layout.widgets)
    ) {
      return false;
    }

    // Validate each widget
    for (const widget of layout.widgets) {
      if (!this.isValidWidget(widget)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate the structure of a widget
   */
  private isValidWidget(widget: any): widget is Widget {
    if (!widget || typeof widget !== 'object') {
      return false;
    }

    const validTypes = ['weather', 'chart', 'tasks', 'stats'];
    
    return (
      typeof widget.id === 'string' &&
      validTypes.includes(widget.type) &&
      typeof widget.title === 'string' &&
      widget.position &&
      typeof widget.position.row === 'number' &&
      typeof widget.position.col === 'number' &&
      widget.size &&
      typeof widget.size.width === 'number' &&
      typeof widget.size.height === 'number'
    );
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): { used: number; available: boolean } {
    if (!this.isLocalStorageAvailable()) {
      return { used: 0, available: false };
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const used = stored ? new Blob([stored]).size : 0;
      return { used, available: true };
    } catch (error) {
      return { used: 0, available: false };
    }
  }
} 