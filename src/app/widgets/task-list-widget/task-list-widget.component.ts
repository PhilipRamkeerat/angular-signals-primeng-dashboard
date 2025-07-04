import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from 'primeng/dragdrop';
import { ThemeService } from '../../services/theme.service';

interface Task {
  id: number;
  name: string;
  completed: boolean;
}

@Component({
  selector: 'app-task-list-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, FormsModule, DragDropModule],
  template: `
    <p-card class="h-full">
      <ng-template pTemplate="header">
        <div class="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div class="flex items-center gap-2">
            <i class="pi pi-list text-xl"></i>
            <span class="font-semibold">Tasks</span>
          </div>
          <div class="flex gap-2">
            <button 
              pButton 
              pRipple 
              class="p-button-text p-button-sm text-white hover:bg-white/20" 
              icon="pi pi-arrows-alt" 
              pTooltip="Drag to move"
              [style.cursor]="'grab'"
            ></button>
          </div>
        </div>
      </ng-template>
      
      <ng-template pTemplate="content">
        <div class="space-y-3">
          <div class="flex justify-between items-center mb-4">
            <span class="text-sm" 
                  [ngClass]="{
                    'text-gray-600': themeService.isLightMode(),
                    'text-gray-300': themeService.isDarkMode()
                  }">
              {{ completedTasksCount() }}/{{ tasks().length }} completed
            </span>
            <div class="w-full ml-3 rounded-full h-2"
                 [ngClass]="{
                   'bg-gray-200': themeService.isLightMode(),
                   'bg-gray-600': themeService.isDarkMode()
                 }">
              <div 
                class="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                [style.width.%]="completionPercentage()"
              ></div>
            </div>
          </div>
          
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div 
              *ngFor="let task of tasks(); trackBy: trackByTask" 
              class="flex items-center gap-3 p-2 rounded-lg transition-colors"
              [ngClass]="{
                'hover:bg-gray-50': themeService.isLightMode(),
                'hover:bg-gray-700': themeService.isDarkMode()
              }"
            >
              <input
                type="checkbox"
                class="h-4 w-4 flex-shrink-0 cursor-pointer accent-purple-600 dark:accent-purple-400"
                [checked]="task.completed"
                (change)="toggleTask(task.id)"
              />
              <span 
                class="text-sm transition-all duration-200"
                [ngClass]="{
                  'line-through': task.completed,
                  'text-gray-500': task.completed && themeService.isLightMode(),
                  'text-gray-400': task.completed && themeService.isDarkMode(),
                  'text-gray-800': !task.completed && themeService.isLightMode(),
                  'text-gray-100': !task.completed && themeService.isDarkMode()
                }"
              >
                {{ task.name }}
              </span>
            </div>
          </div>
          
          <div class="pt-3 border-t"
               [ngClass]="{
                 'border-gray-200': themeService.isLightMode(),
                 'border-gray-600': themeService.isDarkMode()
               }">
            <button 
              pButton 
              pRipple 
              label="Add Task" 
              icon="pi pi-plus" 
              class="p-button-text p-button-sm w-full justify-center"
              [ngClass]="{
                'text-purple-600 hover:bg-purple-50': themeService.isLightMode(),
                'text-purple-400 hover:bg-purple-900/20': themeService.isDarkMode()
              }"
              (click)="addSampleTask()"
            ></button>
          </div>
        </div>
      </ng-template>
    </p-card>
  `
})
export class TaskListWidgetComponent {
  @Input() position?: { x: number; y: number };
  @Output() dragStart = new EventEmitter<void>();
  
  public readonly themeService = inject(ThemeService);

  // Signal-based state management
  private readonly _tasks = signal<Task[]>([
    { id: 1, name: 'Review quarterly reports', completed: true },
    { id: 2, name: 'Update project timeline', completed: false },
    { id: 3, name: 'Schedule team meeting', completed: true },
    { id: 4, name: 'Prepare presentation', completed: false },
    { id: 5, name: 'Send follow-up emails', completed: false }
  ]);

  // Public readonly signals
  public readonly tasks = this._tasks.asReadonly();

  // Computed signals
  public readonly completedTasksCount = computed(() => 
    this._tasks().filter(task => task.completed).length
  );

  public readonly completionPercentage = computed(() => {
    const total = this._tasks().length;
    const completed = this.completedTasksCount();
    return total > 0 ? (completed / total) * 100 : 0;
  });

  toggleTask(taskId: number): void {
    const currentTasks = this._tasks();
    const updatedTasks = currentTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    this._tasks.set(updatedTasks);
  }

  addSampleTask(): void {
    const sampleTasks = [
      'Review documentation',
      'Test new features',
      'Update dependencies',
      'Write unit tests',
      'Code review',
      'Deploy to staging'
    ];
    
    const currentTasks = this._tasks();
    const newId = Math.max(...currentTasks.map(t => t.id)) + 1;
    const randomTask = sampleTasks[Math.floor(Math.random() * sampleTasks.length)];
    
    const newTask: Task = {
      id: newId,
      name: randomTask,
      completed: false
    };
    
    this._tasks.set([...currentTasks, newTask]);
  }

  trackByTask(index: number, task: Task): number {
    return task.id;
  }

  onDragStart(): void {
    this.dragStart.emit();
  }
} 