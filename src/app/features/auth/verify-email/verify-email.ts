import { Component, computed, inject, signal } from '@angular/core';
import { VerifyEmailService } from '../../../core/auth/verify-email-service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/auth/auth-service';
import { Router } from '@angular/router';
import { finalize, map, Subscription, takeWhile, timer } from 'rxjs';

@Component({
  selector: 'app-verify-email',
  imports: [
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail {
  private readonly verifyEmail = inject(VerifyEmailService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly currentUser = this.auth.currentUser();

  private timerSub?: Subscription;
  private readonly COOLDOWN_SECONDS = 60;
  readonly countdownTimer = signal<number>(0);

  readonly countdownTimerText = computed(() => {
    if(this.isLoading()) return "Sending";
    if(this.countdownTimer() > 0) return `Resend again in ${this.countdownTimer()} seconds`
    return "Resend e-mail";
  });

  resendEmail() : void {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.message.set(null);
    this.error.set(null);

    this.verifyEmail.resendEmail().subscribe({
      next: () => {
        this.message.set('Verification link sent! Please check your inbox.');
        this.isLoading.set(false);
        this.startCountdown();
      },
      error: () => {
        this.error.set('Failed to send email. Please try again later.');
        this.isLoading.set(false);
      }
    })
  }

  private startCountdown() {
    this.countdownTimer.set(this.COOLDOWN_SECONDS);

    this.timerSub = timer(0, 1000).pipe(
      map(i => this.COOLDOWN_SECONDS - i),
      takeWhile(val => val >= 0),
      map(val => this.countdownTimer.set(val)),
      finalize(() => this.countdownTimer.set(0))
    ).subscribe();
  }

}
