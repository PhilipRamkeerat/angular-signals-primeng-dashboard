import { Component, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { DragDropModule } from 'primeng/dragdrop';

import { AuthService, User } from '../services/auth.service';
import { WidgetStorageService, Widget } from '../services/widget-storage.service';
import { WeatherWidgetComponent } from '../widgets/weather-widget/weather-widget.component';
import { ChartWidgetComponent } from '../widgets/chart-widget/chart-widget.component';
import { TaskListWidgetComponent } from '../widgets/task-list-widget/task-list-widget.component';
import { QuickStatsWidgetComponent } from '../widgets/quick-stats-widget/quick-stats-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    ToastModule,
    TooltipModule,
    DragDropModule,
    WeatherWidgetComponent,
    ChartWidgetComponent,
    TaskListWidgetComponent,
    QuickStatsWidgetComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [MessageService]
})
export class DashboardComponent {
  // Dependency injection using inject()
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly widgetStorageService = inject(WidgetStorageService);

  // Signals for component state
  private readonly _draggedWidget = signal<Widget | null>(null);
  private readonly _dragOverIndex = signal<number>(-1);

  // Public readonly signals
  public readonly currentUser = this.authService.currentUser;
  public readonly widgets = this.widgetStorageService.widgets;
  public readonly draggedWidget = this._draggedWidget.asReadonly();
  public readonly dragOverIndex = this._dragOverIndex.asReadonly();
  public readonly hasChanges = this.widgetStorageService.hasChanges;

  // Computed signals
  public readonly userInitials = computed(() => {
    const user = this.currentUser();
    return user ? this.getInitials(user.username) : '';
  });

  public readonly storageInfo = computed(() => this.widgetStorageService.getStorageInfo());

  constructor() {
    // Set up effect for user changes and widget layout loading
    this.setupUserEffects();
  }

  private setupUserEffects(): void {
    // Effect to handle user changes and load widget layout
    effect(() => {
      const user = this.currentUser();
      if (user) {
        const userId = String(user.id || user.username);
        this.widgetStorageService.setCurrentUser(userId);
        this.showLayoutLoadedMessage(userId);
      }
    });
  }

  private showLayoutLoadedMessage(userId: string): void {
    const lastUpdated = this.widgetStorageService.getLastUpdated(userId);
    if (lastUpdated) {
      const updateTime = new Date(lastUpdated).toLocaleString();
      console.log(`Widget layout loaded from ${updateTime}`);
      
      // Show notification for loaded custom layout
      setTimeout(() => {
        this.messageService.add({
          severity: 'info',
          summary: 'Layout Loaded',
          detail: `Your custom widget layout from ${updateTime} has been restored.`,
          life: 3000
        });
      }, 500);
    }
  }

  logout(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Logging Out',
      detail: 'You have been successfully logged out.'
    });

    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/login']);
    }, 1000);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }



  onDragStart(widget: Widget): void {
    this._draggedWidget.set(widget);
  }

  onDragEnd(): void {
    this._draggedWidget.set(null);
    this._dragOverIndex.set(-1);
  }

  onDrop(targetIndex: number): void {
    const draggedWidget = this._draggedWidget();
    if (!draggedWidget) {
      this.onDragEnd();
      return;
    }

    // Map target index to position
    const targetPosition = this.mapIndexToPosition(targetIndex);
    if (!targetPosition) {
      this.onDragEnd();
      return;
    }

    const currentWidgets = this.widgets();
    const draggedIndex = currentWidgets.findIndex(w => w.id === draggedWidget.id);
    
    // Find the widget at the target position
    const targetWidget = currentWidgets.find(w => 
      w.position.row === targetPosition.row && w.position.col === targetPosition.col
    );

    if (draggedIndex !== -1 && targetWidget && draggedWidget.id !== targetWidget.id) {
      // Create new array with properly swapped widgets
      const updatedWidgets = [...currentWidgets];
      
      // Find the index of the target widget
      const targetWidgetIndex = updatedWidgets.findIndex(w => w.id === targetWidget.id);
      
      // Swap the positions between the dragged widget and target widget
      const tempPosition = { ...draggedWidget.position };
      updatedWidgets[draggedIndex] = {
        ...draggedWidget,
        position: { ...targetWidget.position }
      };
      updatedWidgets[targetWidgetIndex] = {
        ...targetWidget,
        position: { ...tempPosition }
      };
      
      // Update widgets which will trigger auto-save
      this.widgetStorageService.updateWidgets(updatedWidgets);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Widget Moved',
        detail: `${draggedWidget.title} widget has been repositioned and saved.`
      });
    }
    
    this.onDragEnd();
  }

  onDragEnter(index: number): void {
    // Only set drag over if we're currently dragging something
    if (this._draggedWidget()) {
      this._dragOverIndex.set(index);
    }
  }

  onDragLeave(): void {
    // Add small delay to prevent flickering when moving between child elements
    setTimeout(() => {
      this._dragOverIndex.set(-1);
    }, 50);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  resetLayout(): void {
    const user = this.currentUser();
    if (!user) return;

    const userId = String(user.id || user.username);
    const resetWidgets = this.widgetStorageService.resetWidgetLayout(userId);
    
    this.messageService.add({
      severity: 'info',
      summary: 'Layout Reset',
      detail: 'Widget layout has been reset to default.'
    });
  }

  getWidgetByPosition(row: number, col: number): Widget | undefined {
    return this.widgets().find(w => w.position.row === row && w.position.col === col);
  }

  saveLayout(): void {
    const user = this.currentUser();
    if (!user) return;

    const userId = String(user.id || user.username);
    const success = this.widgetStorageService.saveWidgetLayout(userId, this.widgets());
    
    if (success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Layout Saved',
        detail: 'Your widget layout has been saved successfully.'
      });
    }
  }

  clearAllSavedLayouts(): void {
    this.widgetStorageService.clearAllLayouts();
    
    this.messageService.add({
      severity: 'info',
      summary: 'All Layouts Cleared',
      detail: 'All saved widget layouts have been cleared.'
    });
  }

  private mapIndexToPosition(index: number): { row: number; col: number } | null {
    // Map grid indices to row/col positions
    // Grid layout: 2x2
    // Index 0: row 0, col 0 (top-left)
    // Index 1: row 0, col 1 (top-right)
    // Index 2: row 1, col 0 (bottom-left)
    // Index 3: row 1, col 1 (bottom-right)
    switch (index) {
      case 0:
        return { row: 0, col: 0 };
      case 1:
        return { row: 0, col: 1 };
      case 2:
        return { row: 1, col: 0 };
      case 3:
        return { row: 1, col: 1 };
      default:
        return null;
    }
  }

  private mapPositionToIndex(row: number, col: number): number {
    // Map row/col positions to grid indices
    if (row === 0 && col === 0) return 0;
    if (row === 0 && col === 1) return 1;
    if (row === 1 && col === 0) return 2;
    if (row === 1 && col === 1) return 3;
    return -1;
  }
} 