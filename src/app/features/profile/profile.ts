import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker'; // <--- NEW
import { MatNativeDateModule } from '@angular/material/core';       // <--- NEW
import { AuthService } from '../../core/auth/auth-service';
import { SnackbarService } from '../../core/services/snackbar-service';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../core/services/user-service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ]
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private snack = inject(SnackbarService);

  readonly isLoading = signal(false);

  readonly profileForm = this.fb.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    date_of_birth: ['', [Validators.required]],

    // ADDRESS SECTION
    address_line_1: ['', [Validators.required]],
    city: ['', [Validators.required]],
    state: ['', [Validators.required]],
    postal_code: ['', [Validators.required]],
    country_code: ['', [Validators.maxLength(2)]]
  });

  // Image input
  selectedFile: File | null = null;
  readonly imagePreview = signal<string | null>(null);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if(input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;

      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  ngOnInit(): void {
    this.userService.get().subscribe({
      next: (res) => {
        this.profileForm.patchValue({
          first_name: res.user.first_name,
          last_name: res.user.last_name,
          date_of_birth: res.user.date_of_birth, 
          address_line_1: res.user.address_line_1,
          city: res.user.city,
          state: res.user.state,
          postal_code: res.user.postal_code,
          country_code: res.user.country_code
        });

        if(res.user.image) {
          this.imagePreview.set(res.user.image);
        }
      },
      error(err: any) {
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid || this.isLoading()) return;
    this.isLoading.set(true);

    const formValues = this.profileForm.getRawValue();
    const formData = new FormData();

    for (const [key, value] of Object.entries(formValues)) {

      if (key === 'date_of_birth' && value) {
        const date = new Date(value);
        const formattedDate = this.formatDate(date);
        formData.append(key, formattedDate);
      } 
      // Append everything else normally
      else {
        formData.append(key, value!);
      }
    }
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.auth.updateUser(formData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.snack.showSnack('Profile updated successfully!');
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error(err);
        this.snack.showSnack('Failed to update the profile... Please contact customer support.');
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}