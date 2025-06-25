import { Component, Input, Output, EventEmitter, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '../../services/theme.service';

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
  highTemp: number;
  lowTemp: number;
  icon: string;
}

@Component({
  selector: 'app-weather-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <p-card class="h-full">
      <ng-template pTemplate="header">
        <div class="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div class="flex items-center gap-2">
            <i [class]="weatherData().icon" class="text-xl"></i>
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
              (click)="onDragStart()"
            ></button>
            <button 
              pButton 
              pRipple 
              class="p-button-text p-button-sm text-white hover:bg-white/20" 
              icon="pi pi-refresh" 
              pTooltip="Refresh weather"
              (click)="refreshWeather()"
              [loading]="isLoading()"
            ></button>
          </div>
        </div>
      </ng-template>
      
      <ng-template pTemplate="content">
        <div class="space-y-4">
          <div class="text-center">
            <div class="text-4xl font-bold text-blue-600 mb-2">
              {{ weatherData().temperature }}°C
            </div>
            <div class="text-lg mb-1 transition-colors duration-300"
                 [class]="themeService.isDarkMode() ? 'text-gray-200' : 'text-gray-700'">{{ weatherData().condition }}</div>
            <div class="text-sm transition-colors duration-300"
                 [class]="themeService.isDarkMode() ? 'text-gray-400' : 'text-gray-500'">{{ weatherData().location }}</div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 pt-4 border-t transition-colors duration-300"
               [class]="themeService.isDarkMode() ? 'border-gray-600' : 'border-gray-200'">
            <div class="text-center">
              <div class="text-xs uppercase tracking-wide transition-colors duration-300"
                   [class]="themeService.isDarkMode() ? 'text-gray-400' : 'text-gray-500'">Humidity</div>
              <div class="text-lg font-semibold transition-colors duration-300"
                   [class]="themeService.isDarkMode() ? 'text-gray-100' : 'text-gray-800'">{{ weatherData().humidity }}%</div>
            </div>
            <div class="text-center">
              <div class="text-xs uppercase tracking-wide transition-colors duration-300"
                   [class]="themeService.isDarkMode() ? 'text-gray-400' : 'text-gray-500'">Wind</div>
              <div class="text-lg font-semibold transition-colors duration-300"
                   [class]="themeService.isDarkMode() ? 'text-gray-100' : 'text-gray-800'">{{ weatherData().windSpeed }} km/h</div>
            </div>
          </div>
          
          <div class="flex justify-between text-sm pt-2 transition-colors duration-300"
               [class]="themeService.isDarkMode() ? 'text-gray-300' : 'text-gray-600'">
            <span>High: {{ weatherData().highTemp }}°C</span>
            <span>Low: {{ weatherData().lowTemp }}°C</span>
          </div>
          
          <div class="text-xs text-center pt-2 transition-colors duration-300"
               [class]="themeService.isDarkMode() ? 'text-gray-500' : 'text-gray-400'">
            Last updated: {{ lastUpdated() }}
          </div>
        </div>
      </ng-template>
    </p-card>
  `
})
export class WeatherWidgetComponent {
  @Input() position?: { x: number; y: number };
  @Output() dragStart = new EventEmitter<void>();
  
  public readonly themeService = inject(ThemeService);

  // Signals for component state
  private readonly _weatherData = signal<WeatherData>({
    temperature: 22,
    condition: 'Sunny',
    location: 'New York, NY',
    humidity: 65,
    windSpeed: 12,
    highTemp: 25,
    lowTemp: 18,
    icon: 'pi pi-sun'
  });

  private readonly _isLoading = signal<boolean>(false);
  private readonly _lastUpdateTime = signal<Date>(new Date());

  // Public readonly signals
  public readonly weatherData = this._weatherData.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  
  // Computed signals
  public readonly lastUpdated = computed(() => {
    const time = this._lastUpdateTime();
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  public readonly weatherConditionIcon = computed(() => {
    const condition = this._weatherData().condition.toLowerCase();
    if (condition.includes('sunny')) return 'pi pi-sun';
    if (condition.includes('cloud')) return 'pi pi-cloud';
    if (condition.includes('rain')) return 'pi pi-cloud-rain';
    if (condition.includes('snow')) return 'pi pi-snowflake';
    return 'pi pi-sun';
  });

  constructor() {
    // Effect to update weather icon based on condition
    effect(() => {
      const currentData = this._weatherData();
      const newIcon = this.weatherConditionIcon();
      
      if (currentData.icon !== newIcon) {
        this._weatherData.set({
          ...currentData,
          icon: newIcon
        });
      }
    }, { allowSignalWrites: true });

    // Simulate automatic weather updates every 5 minutes
    this.setupAutoRefresh();
  }

  private setupAutoRefresh(): void {
    setInterval(() => {
      this.refreshWeather();
    }, 5 * 60 * 1000); // 5 minutes
  }

  onDragStart(): void {
    this.dragStart.emit();
  }

  async refreshWeather(): Promise<void> {
    this._isLoading.set(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock weather data
      const mockWeatherData: WeatherData = {
        temperature: Math.floor(Math.random() * 15) + 15, // 15-30°C
        condition: this.getRandomCondition(),
        location: 'New York, NY',
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        highTemp: 0,
        lowTemp: 0,
        icon: 'pi pi-sun'
      };

      // Set high/low based on current temp
      mockWeatherData.highTemp = mockWeatherData.temperature + Math.floor(Math.random() * 5) + 2;
      mockWeatherData.lowTemp = mockWeatherData.temperature - Math.floor(Math.random() * 8) - 3;

      this._weatherData.set(mockWeatherData);
      this._lastUpdateTime.set(new Date());
      
    } finally {
      this._isLoading.set(false);
    }
  }

  private getRandomCondition(): string {
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }
} 