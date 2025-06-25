import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule
  ],
  template: `
    <p-button
      [icon]="themeService.isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'"
      [severity]="themeService.isDarkMode() ? 'secondary' : 'primary'"
      [outlined]="true"
      [rounded]="true"
      size="small"
      (onClick)="toggleTheme()"
      [pTooltip]="themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      tooltipPosition="bottom"
      class="theme-toggle-button"
    />
  `,
  styles: [`
    .theme-toggle-button {
      transition: all 0.3s ease;
    }
    
    .theme-toggle-button:hover {
      transform: scale(1.05);
    }
  `]
})
export class ThemeToggleComponent {
  public readonly themeService = inject(ThemeService);
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
} 