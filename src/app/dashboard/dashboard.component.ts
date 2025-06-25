import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, combineLatest, debounceTime } from 'rxjs';

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
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  widgets: Widget[] = [];
  draggedWidget: Widget | null = null;
  dragOverIndex: number = -1;
  
  private readonly destroy$ = new Subject<void>();
  private pendingSave$ = new Subject<void>();
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private widgetStorageService: WidgetStorageService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          const userId = String(user.id || user.username);
          this.loadWidgetLayout(userId);
        }
      });
  }

  private loadWidgetLayout(userId: string): void {
    const savedLayout = this.widgetStorageService.getWidgetLayout(userId);
    this.widgets = [...savedLayout];
    
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
      }, 500); // Small delay to avoid showing too early
    }
  }

  private setupAutoSave(): void {
    // Auto-save widget positions with debouncing to avoid excessive saves
    this.pendingSave$
      .pipe(
        debounceTime(1000), // Wait 1 second after last change
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.saveCurrentLayout();
      });
  }

  private saveCurrentLayout(): void {
    if (!this.currentUser) {
      return;
    }

    const userId = String(this.currentUser.id || this.currentUser.username);
    const success = this.widgetStorageService.saveWidgetLayout(userId, this.widgets);
    
    if (success) {
      console.log('Widget layout auto-saved');
    }
  }

  private triggerAutoSave(): void {
    this.pendingSave$.next();
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
    this.draggedWidget = widget;
  }

  onDragEnd(): void {
    this.draggedWidget = null;
    this.dragOverIndex = -1;
  }

  onDrop(targetIndex: number): void {
    if (this.draggedWidget) {
      const draggedIndex = this.widgets.findIndex(w => w.id === this.draggedWidget!.id);
      
      if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
        // Swap widgets positions
        const targetWidget = this.widgets[targetIndex];
        const draggedWidgetPos = { ...this.draggedWidget.position };
        
        this.draggedWidget.position = { ...targetWidget.position };
        targetWidget.position = { ...draggedWidgetPos };
        
        // Trigger auto-save after position change
        this.triggerAutoSave();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Widget Moved',
          detail: `${this.draggedWidget.title} widget has been repositioned and saved.`
        });
      }
    }
    
    this.onDragEnd();
  }

  onDragEnter(index: number): void {
    this.dragOverIndex = index;
  }

  onDragLeave(): void {
    this.dragOverIndex = -1;
  }

  resetLayout(): void {
    if (!this.currentUser) {
      return;
    }

    const userId = String(this.currentUser.id || this.currentUser.username);
    this.widgets = this.widgetStorageService.resetWidgetLayout(userId);
    
    this.messageService.add({
      severity: 'info',
      summary: 'Layout Reset',
      detail: 'Widget layout has been reset to default.'
    });
  }

  getWidgetByPosition(row: number, col: number): Widget | undefined {
    return this.widgets.find(w => w.position.row === row && w.position.col === col);
  }

  /**
   * Get storage information for debugging or user info
   */
  getStorageInfo(): { used: number; available: boolean } {
    return this.widgetStorageService.getStorageInfo();
  }

  /**
   * Manual save method (can be triggered by a button if needed)
   */
  saveLayout(): void {
    this.saveCurrentLayout();
    this.messageService.add({
      severity: 'success',
      summary: 'Layout Saved',
      detail: 'Your widget layout has been saved successfully.'
    });
  }

  /**
   * Clear all saved layouts (for debugging or user data cleanup)
   */
  clearAllSavedLayouts(): void {
    this.widgetStorageService.clearAllLayouts();
    this.messageService.add({
      severity: 'warn',
      summary: 'Layouts Cleared',
      detail: 'All saved widget layouts have been cleared.'
    });
  }
} 