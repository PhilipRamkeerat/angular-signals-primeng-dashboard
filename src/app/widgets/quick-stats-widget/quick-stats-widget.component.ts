import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-quick-stats-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <p-card class="h-full">
      <ng-template pTemplate="header">
        <div class="flex justify-between items-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div class="flex items-center gap-2">
            <i class="pi pi-chart-pie text-xl"></i>
            <span class="font-semibold">Quick Stats</span>
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
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600 mb-1">148</div>
              <div class="text-xs text-gray-600 uppercase tracking-wide">Active Users</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600 mb-1">86%</div>
              <div class="text-xs text-gray-600 uppercase tracking-wide">Success Rate</div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-3 bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600 mb-1">42</div>
              <div class="text-xs text-gray-600 uppercase tracking-wide">Projects</div>
            </div>
            <div class="text-center p-3 bg-red-50 rounded-lg">
              <div class="text-2xl font-bold text-red-600 mb-1">12</div>
              <div class="text-xs text-gray-600 uppercase tracking-wide">Issues</div>
            </div>
          </div>
          
          <div class="pt-3 border-t border-gray-200">
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-600">Last updated:</span>
              <span class="text-gray-800 font-medium">2 mins ago</span>
            </div>
          </div>
        </div>
      </ng-template>
    </p-card>
  `
})
export class QuickStatsWidgetComponent {
  @Input() position?: { x: number; y: number };
  @Output() dragStart = new EventEmitter<void>();

  onDragStart() {
    this.dragStart.emit();
  }
} 