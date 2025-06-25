import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';

import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    ChipModule,
    ToastModule,
    MenubarModule,
    TooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [MessageService]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  menuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.initializeMenu();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private initializeMenu(): void {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: '/dashboard'
      },
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => this.showProfileInfo()
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => this.showSettingsInfo()
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
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

  showProfileInfo(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Profile',
      detail: `Username: ${this.currentUser?.username}, Role: ${this.currentUser?.role}`
    });
  }

  showSettingsInfo(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Settings',
      detail: 'Settings panel would open here in a real application.'
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getRoleColor(role: string): string {
    switch (role.toLowerCase()) {
      case 'administrator': return 'bg-red-500';
      case 'user': return 'bg-blue-500';
      case 'demo user': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }

  getCurrentDateTime(): string {
    return new Date().toLocaleString();
  }
} 