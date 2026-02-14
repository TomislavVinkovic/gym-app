import { inject, Injectable } from '@angular/core';
import { ApiService } from '../services/api-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VerifyEmailService {
  private readonly api = inject(ApiService);

  resendEmail() : Observable<void> {
    return this.api.post('/email/resend');
  }
}
