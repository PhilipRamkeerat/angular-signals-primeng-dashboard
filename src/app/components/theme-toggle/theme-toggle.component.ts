import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  template: `
    <p-button
      [icon]="getThemeIcon()"
      [severity]="getButtonSeverity()"
      [outlined]="true"
      [rounded]="true"
      size="small"
      (onClick)="toggleTheme()"
      [pTooltip]="getTooltipText()"
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
  
  getThemeIcon(): string {
    return this.themeService.isDarkMode() ? 'pi pi-sun' : 'pi pi-moon';
  }
  
  getButtonSeverity(): 'primary' | 'secondary' {
    return this.themeService.isDarkMode() ? 'secondary' : 'primary';
  }
  
  getTooltipText(): string {
    return this.themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }
} 