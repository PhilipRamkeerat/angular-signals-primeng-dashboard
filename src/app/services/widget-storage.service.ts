import { Injectable, signal, computed } from '@angular/core';

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

  // Signals instead of BehaviorSubjects
  private readonly _widgets = signal<Widget[]>([...this.DEFAULT_WIDGETS]);
  private readonly _currentUserId = signal<string>('');
  private _autoSaveTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Public readonly signals
  public readonly widgets = this._widgets.asReadonly();
  public readonly currentUserId = this._currentUserId.asReadonly();
  public readonly hasChanges = computed(() => {
    const currentWidgets = this._widgets();
    const storedWidgets = this.getStoredWidgets(this._currentUserId());
    return JSON.stringify(currentWidgets) !== JSON.stringify(storedWidgets);
  });

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    // Check if localStorage is available
    if (!this.isLocalStorageAvailable()) {
      console.warn('Local storage is not available. Widget positions will not be persisted.');
      return;
    }
  }

  /**
   * Set the current user and load their widget layout
   */
  setCurrentUser(userId: string): void {
    this._currentUserId.set(userId);
    const userWidgets = this.getWidgetLayout(userId);
    this._widgets.set([...userWidgets]);
  }

  /**
   * Update widgets signal and trigger auto-save
   */
  updateWidgets(widgets: Widget[]): void {
    // Validate widgets before updating
    const validatedWidgets = this.validateAndFixWidgetPositions(widgets);
    this._widgets.set([...validatedWidgets]);
    this.triggerAutoSave();
  }

  /**
   * Validate and fix widget positions to prevent conflicts
   */
  private validateAndFixWidgetPositions(widgets: Widget[]): Widget[] {
    const validatedWidgets = [...widgets];
    const usedPositions = new Set<string>();
    const availablePositions = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 }
    ];

    // First pass: identify and fix duplicate positions
    for (let i = 0; i < validatedWidgets.length; i++) {
      const widget = validatedWidgets[i];
      const positionKey = `${widget.position.row}-${widget.position.col}`;
      
      if (usedPositions.has(positionKey)) {
        // Find an available position for this duplicate
        const availablePosition = availablePositions.find(pos => {
          const key = `${pos.row}-${pos.col}`;
          return !usedPositions.has(key);
        });
        
        if (availablePosition) {
          console.warn(`Duplicate position detected for widget ${widget.id}. Moving to ${availablePosition.row},${availablePosition.col}`);
          validatedWidgets[i] = {
            ...widget,
            position: { ...availablePosition }
          };
          usedPositions.add(`${availablePosition.row}-${availablePosition.col}`);
        } else {
          console.error(`No available position found for widget ${widget.id}`);
        }
      } else {
        // Check if position is within valid bounds
        if (this.isValidPosition(widget.position)) {
          usedPositions.add(positionKey);
        } else {
          // Fix invalid position
          const fallbackPosition = availablePositions.find(pos => {
            const key = `${pos.row}-${pos.col}`;
            return !usedPositions.has(key);
          });
          
          if (fallbackPosition) {
            console.warn(`Invalid position for widget ${widget.id}. Moving to ${fallbackPosition.row},${fallbackPosition.col}`);
            validatedWidgets[i] = {
              ...widget,
              position: { ...fallbackPosition }
            };
            usedPositions.add(`${fallbackPosition.row}-${fallbackPosition.col}`);
          }
        }
      }
    }

    return validatedWidgets;
  }

  /**
   * Check if a position is within valid bounds
   */
  private isValidPosition(position: { row: number; col: number }): boolean {
    return position.row >= 0 && position.row <= 1 && position.col >= 0 && position.col <= 1;
  }

  /**
   * Trigger auto-save with debouncing
   */
  private triggerAutoSave(): void {
    const userId = this._currentUserId();
    if (!userId || !this.isLocalStorageAvailable()) return;

    // Clear existing timeout
    if (this._autoSaveTimeoutId) {
      clearTimeout(this._autoSaveTimeoutId);
    }

    // Set new timeout for auto-save
    this._autoSaveTimeoutId = setTimeout(() => {
      const success = this.saveWidgetLayout(userId, this._widgets());
      if (success) {
        console.log('Auto-save completed successfully');
      } else {
        console.error('Auto-save failed');
      }
      this._autoSaveTimeoutId = null;
    }, 1000);
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
   * Get stored widgets for comparison
   */
  private getStoredWidgets(userId: string): Widget[] {
    if (!userId || !this.isLocalStorageAvailable()) {
      return [...this.DEFAULT_WIDGETS];
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [...this.DEFAULT_WIDGETS];

      const layout: WidgetLayout = JSON.parse(stored);
      if (layout.userId === userId) {
        return layout.widgets;
      }
    } catch (error) {
      console.error('Error reading stored widgets:', error);
    }

    return [...this.DEFAULT_WIDGETS];
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
    const defaultWidgets = [...this.DEFAULT_WIDGETS];
    
    if (this.isLocalStorageAvailable()) {
      try {
        // Save default layout to localStorage
        this.saveWidgetLayout(userId, defaultWidgets);
      } catch (error) {
        console.error('Error resetting widget layout:', error);
      }
    }
    
    this._widgets.set(defaultWidgets);
    return defaultWidgets;
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
    this._widgets.set([...this.DEFAULT_WIDGETS]);
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
   * Validate widget layout structure
   */
  private isValidLayout(layout: any): layout is WidgetLayout {
    return (
      layout &&
      typeof layout === 'object' &&
      typeof layout.userId === 'string' &&
      Array.isArray(layout.widgets) &&
      typeof layout.lastUpdated === 'number' &&
      typeof layout.version === 'string' &&
      layout.widgets.every((widget: any) => this.isValidWidget(widget))
    );
  }

  /**
   * Validate individual widget structure
   */
  private isValidWidget(widget: any): widget is Widget {
    return (
      widget &&
      typeof widget === 'object' &&
      typeof widget.id === 'string' &&
      ['weather', 'chart', 'tasks', 'stats'].includes(widget.type) &&
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