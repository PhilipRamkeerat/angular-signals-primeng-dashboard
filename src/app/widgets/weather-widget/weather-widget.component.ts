import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-weather-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <p-card class="h-full">
      <ng-template pTemplate="header">
        <div class="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div class="flex items-center gap-2">
            <i class="pi pi-cloud text-xl"></i>
            <span class="font-semibold">Weather</span>
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
          <div class="text-center">
            <div class="text-4xl font-bold text-blue-600 mb-2">22°C</div>
            <div class="text-lg text-gray-700 mb-1">Sunny</div>
            <div class="text-sm text-gray-500">New York, NY</div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div class="text-center">
              <div class="text-xs text-gray-500 uppercase tracking-wide">Humidity</div>
              <div class="text-lg font-semibold text-gray-800">65%</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-500 uppercase tracking-wide">Wind</div>
              <div class="text-lg font-semibold text-gray-800">12 km/h</div>
            </div>
          </div>
          
          <div class="flex justify-between text-sm text-gray-600 pt-2">
            <span>High: 25°C</span>
            <span>Low: 18°C</span>
          </div>
        </div>
      </ng-template>
    </p-card>
  `
})
export class WeatherWidgetComponent {
  @Input() position?: { x: number; y: number };
  @Output() dragStart = new EventEmitter<void>();

  onDragStart() {
    this.dragStart.emit();
  }
} 