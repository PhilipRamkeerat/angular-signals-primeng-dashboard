import { Component, OnInit } from '@angular/core';
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
import { WeatherWidgetComponent } from '../widgets/weather-widget/weather-widget.component';
import { ChartWidgetComponent } from '../widgets/chart-widget/chart-widget.component';
import { TaskListWidgetComponent } from '../widgets/task-list-widget/task-list-widget.component';
import { QuickStatsWidgetComponent } from '../widgets/quick-stats-widget/quick-stats-widget.component';

interface Widget {
  id: string;
  type: 'weather' | 'chart' | 'tasks' | 'stats';
  title: string;
  position: { row: number; col: number };
  size: { width: number; height: number };
}

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
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  widgets: Widget[] = [];
  draggedWidget: Widget | null = null;
  dragOverIndex: number = -1;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.initializeWidgets();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private initializeWidgets(): void {
    this.widgets = [
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
        
        this.messageService.add({
          severity: 'success',
          summary: 'Widget Moved',
          detail: `${this.draggedWidget.title} widget has been repositioned.`
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
    this.initializeWidgets();
    this.messageService.add({
      severity: 'info',
      summary: 'Layout Reset',
      detail: 'Widget layout has been reset to default.'
    });
  }

  getWidgetByPosition(row: number, col: number): Widget | undefined {
    return this.widgets.find(w => w.position.row === row && w.position.col === col);
  }
} 