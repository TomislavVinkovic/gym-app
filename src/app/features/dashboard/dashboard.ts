import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth-service';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarService } from '../../core/services/snackbar-service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatButton,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snack = inject(SnackbarService);

  profileCompleted = this.auth.profileCompleted;
  currentUser = this.auth.currentUser;

  ngOnInit() : void {
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'invalid_link') {
        this.snack.showSnack('The verification link is invalid or expired.');
        this.clearParams();
      }

      if (params['message'] === 'already_verified') {
        this.snack.showSnack('Email already verified.');
        this.clearParams();
      }
    });
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  goToEditProfile() {
    this.router.navigate(['/profile']);
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