import { Component, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';

import { AuthService, LoginCredentials } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { ThemeToggleComponent } from '../components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    ToastModule,
    ProgressSpinnerModule,
    DividerModule,
    ChipModule,
    ThemeToggleComponent
  ],
  templateUrl: './login.component.html',
  providers: [MessageService]
})
export class LoginComponent {
  // Dependency injection using inject()
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  public readonly themeService = inject(ThemeService);

  // Signals for component state
  private readonly _formTouched = signal<boolean>(false);
  public readonly isLoading = this.authService.isLoading;
  public readonly demoCredentials = signal(this.authService.getDemoCredentials());

  // Form setup
  public readonly loginForm: FormGroup;

  // Computed signals for form validation
  public readonly isFormValid = computed(() => this.loginForm?.valid ?? false);
  public readonly username = computed(() => this.loginForm?.get('username'));
  public readonly password = computed(() => this.loginForm?.get('password'));

  constructor() {
    // Initialize form
    this.loginForm = this.fb.group({
      username: ['admin', [Validators.required, Validators.minLength(3)]],
      password: ['admin123', [Validators.required, Validators.minLength(6)]]
    });

    // Set up automatic form validation feedback
    effect(() => {
      if (this._formTouched()) {
        this.updateFormValidation();
      }
    });
  }

  async onSubmit(): Promise<void> {
    this._formTouched.set(true);
    
    if (this.loginForm.valid) {
      const credentials: LoginCredentials = this.loginForm.value;

      try {
        const user = await this.authService.login(credentials);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Login Successful',
          detail: `Welcome back, ${user.username}!`
        });
        
        // Navigate after a short delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
        
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: 'Use demo credential: Login: admin | Password: admin123'
        });
      }
    } else {
      this.markFormGroupTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Form Invalid',
        detail: 'Please fill in all required fields correctly'
      });
    }
  }

  onDemoLogin(username: string): void {
    const demoPassword = 'admin123';
    
    this.loginForm.patchValue({
      username: username,
      password: demoPassword
    });

    this.messageService.add({
      severity: 'info',
      summary: 'Demo Credentials Filled',
      detail: `Click "Sign In" to login as ${username}`
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
      }
    }
    return '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private updateFormValidation(): void {
    this.markFormGroupTouched();
  }
} 