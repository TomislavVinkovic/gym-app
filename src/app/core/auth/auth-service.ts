import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../services/api-service';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User } from '../models/auth/user';
import { UserService } from '../services/user-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(null);

  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isVerified = computed(() => !!this.currentUser() && !!this.currentUser()?.email_verified_at)
  readonly profileCompleted = computed(() => {
    return (
      !!this.currentUser()?.first_name &&
      !!this.currentUser()?.last_name &&
      !!this.currentUser()?.date_of_birth &&
      !!this.currentUser()?.address_line_1 &&
      !!this.currentUser()?.city &&
      !!this.currentUser()?.state &&
      !!this.currentUser()?.postal_code &&
      !!this.currentUser()?.country_code &&
      !!this.currentUser()?.image
    );
  });

  constructor() {
    const token = localStorage.getItem('jwtToken');
    if(token) {
      this.refreshUser();
    }
  }

  initializeUser(): Promise<void> {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      this.currentUser.set(null);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.api.get<UserResponse>('/user').subscribe({
        next: (res) => {
          this.setAuth(res.user);
          resolve();
        },
        error: () => {
          this.purgeAuth();
          resolve();
        }
      });
    });
  }

  login(credentials: LoginCredentials) : Observable<UserResponse> {
    return this.api.post<UserResponse>('/auth/login', credentials)
      .pipe(
        tap(
          res => this.setAuth(res.user)
        )
      );
  }
  register(credentials: RegisterCredentials) : Observable<UserResponse> {
    return this.api.post<UserResponse>('/auth/register', credentials)
      .pipe(
        tap(
          res => this.setAuth(res.user)
        )
      );
  }
  logout() : Observable<void> {
    return this.api.get<void>('/auth/logout').pipe(
      tap(
        _ => this.purgeAuth()
      )
    );
  }

  updateUser(formData: FormData) : Observable<UserResponse> {
    return this.userService.updateProfile(formData).pipe(
      tap(res => this.currentUser.set(res.user))
    );
  }

  private refreshUser(): void {
    this.userService.get().subscribe({
      next: (res) => {
        this.currentUser.set(res.user);
      },
      error: () => this.purgeAuth()
    })
  }

  private setAuth(user: User) : void {
    localStorage.setItem('jwtToken', user.token);
    this.currentUser.set(user);
  }

  private purgeAuth() : void {
    localStorage.removeItem('jwtToken');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}

interface LoginCredentials {
  email: string, 
  password: string
}
interface RegisterCredentials {
  email: string, 
  password: string
}

interface UserResponse {
  user: User;
}