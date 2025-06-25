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

  private readonly _weatherData = signal<WeatherData>(this.getDefaultWeatherData());
  private readonly _isLoading = signal<boolean>(false);
  private readonly _lastUpdateTime = signal<Date>(new Date());

  public readonly weatherData = this._weatherData.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  
  public readonly lastUpdated = computed(() => {
    const time = this._lastUpdateTime();
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  public readonly weatherConditionIcon = computed(() => {
    return this.getConditionIcon(this._weatherData().condition);
  });

  constructor() {
    this.setupWeatherIconEffect();
    this.setupAutoRefresh();
  }

  private getDefaultWeatherData(): WeatherData {
    return {
      temperature: 22,
      condition: 'Sunny',
      location: 'New York, NY',
      humidity: 65,
      windSpeed: 12,
      highTemp: 25,
      lowTemp: 18,
      icon: 'pi pi-sun'
    };
  }

  private getConditionIcon(condition: string): string {
    const lowerCondition = condition.toLowerCase();
    const iconMap = new Map([
      ['sunny', 'pi pi-sun'],
      ['cloud', 'pi pi-cloud'],
      ['rain', 'pi pi-cloud-rain'],
      ['snow', 'pi pi-snowflake']
    ]);

    for (const [key, icon] of iconMap) {
      if (lowerCondition.includes(key)) {
        return icon;
      }
    }
    
    return 'pi pi-sun';
  }

  private setupWeatherIconEffect(): void {
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
  }

  private setupAutoRefresh(): void {
    const fiveMinutes = 5 * 60 * 1000;
    setInterval(() => this.refreshWeather(), fiveMinutes);
  }

  onDragStart(): void {
    this.dragStart.emit();
  }

  async refreshWeather(): Promise<void> {
    this._isLoading.set(true);
    
    try {
      await this.simulateApiCall();
      const mockWeatherData = this.generateMockWeatherData();
      this.updateWeatherData(mockWeatherData);
    } finally {
      this._isLoading.set(false);
    }
  }

  private async simulateApiCall(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private generateMockWeatherData(): WeatherData {
    const temperature = this.getRandomInRange(15, 30);
    const weatherData: WeatherData = {
      temperature,
      condition: this.getRandomCondition(),
      location: 'New York, NY',
      humidity: this.getRandomInRange(40, 80),
      windSpeed: this.getRandomInRange(5, 25),
      highTemp: temperature + this.getRandomInRange(2, 7),
      lowTemp: temperature - this.getRandomInRange(3, 11),
      icon: 'pi pi-sun'
    };

    return weatherData;
  }

  private updateWeatherData(weatherData: WeatherData): void {
    this._weatherData.set(weatherData);
    this._lastUpdateTime.set(new Date());
  }

  private getRandomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  private getRandomCondition(): string {
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }
} 