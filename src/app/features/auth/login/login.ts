import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/auth/auth-service';
import { SnackbarService } from '../../../core/services/snackbar-service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snack = inject(SnackbarService);

  // State Signals
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Typed Form
  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngOnInit() : void {
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'invalid_link') {
        this.snack.showSnack('The verification link is invalid or expired.');
        this.clearParams();
      }

      if (params['message'] === 'already_verified') {
        this.snack.showSnack('Email already verified. Please login.');
        this.clearParams();
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials = this.loginForm.getRawValue();

    this.authService.login(credentials).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Invalid email or password.');
        this.isLoading.set(false);
      },
    });
  }

  private clearParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { error: null, message: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
