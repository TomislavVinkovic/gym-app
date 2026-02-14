import { inject, Injectable } from '@angular/core';
import { ApiService } from '../services/api-service';
import { User } from '../models/auth/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api = inject(ApiService);

  get() : Observable<UserResponse> {
    return this.api.get<UserResponse>('/user');
  }

  updateProfile(formData: FormData) : Observable<UserResponse> {
    return this.api.put<UserResponse>('/user', formData);
  }
}

interface UserResponse {
  user: User;
}