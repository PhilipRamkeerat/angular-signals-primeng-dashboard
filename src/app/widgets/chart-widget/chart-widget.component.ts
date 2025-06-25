import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <p-card class="h-full">
      <ng-template pTemplate="header">
        <div class="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div class="flex items-center gap-2">
            <i class="pi pi-chart-bar text-xl"></i>
            <span class="font-semibold">Analytics</span>
          </div>
          <div class="flex gap-2">
            <button 
              pButton 
              pRipple 
              class="p-button-text p-button-sm text-white hover:bg-white/20" 
              icon="pi pi-arrows-alt" 
              pTooltip="Drag to move"
              [style.cursor]="'grab'"
              (mousedown)="onDragStart()"
            ></button>
          </div>
        </div>
      </ng-template>
      
      <ng-template pTemplate="content">
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Revenue Growth</span>
            <span class="text-sm font-semibold text-green-600">+24%</span>
          </div>
          
          <!-- Simple bar chart visualization -->
          <div class="flex items-end justify-between h-32 gap-2">
            <div class="flex flex-col items-center gap-1">
              <div class="bg-green-400 rounded-t w-4" [style.height.px]="45"></div>
              <span class="text-xs text-gray-500">Jan</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div class="bg-green-400 rounded-t w-4" [style.height.px]="65"></div>
              <span class="text-xs text-gray-500">Feb</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div class="bg-green-400 rounded-t w-4" [style.height.px]="85"></div>
              <span class="text-xs text-gray-500">Mar</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div class="bg-green-400 rounded-t w-4" [style.height.px]="72"></div>
              <span class="text-xs text-gray-500">Apr</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div class="bg-green-400 rounded-t w-4" [style.height.px]="95"></div>
              <span class="text-xs text-gray-500">May</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div class="bg-green-400 rounded-t w-4" [style.height.px]="110"></div>
              <span class="text-xs text-gray-500">Jun</span>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div class="text-center">
              <div class="text-xs text-gray-500 uppercase tracking-wide">Total Sales</div>
              <div class="text-lg font-semibold text-gray-800">$24,500</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-500 uppercase tracking-wide">Orders</div>
              <div class="text-lg font-semibold text-gray-800">1,247</div>
            </div>
          </div>
        </div>
      </ng-template>
    </p-card>
  `
})
export class ChartWidgetComponent {
  @Input() position?: { x: number; y: number };
  @Output() dragStart = new EventEmitter<void>();

  onDragStart() {
    this.dragStart.emit();
  }
} 