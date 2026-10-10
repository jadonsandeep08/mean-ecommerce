
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');

  loginForm = this.fb.nonNullable.group({
    email: ['', [
      Validators.required,
      Validators.email
    ]],
    password: ['', [
      Validators.required
    ]]
  });

  onSubmit(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const formData = this.loginForm.getRawValue();

    this.auth.login(formData).subscribe({
      next: (response) => {

        console.log('Login successful:', response.user);

        this.loading.set(false);

        // Redirect to home page
        this.router.navigate(['/']);
      },

      error: (err) => {

        this.loading.set(false);

        this.error.set(
          err.error?.message || 'Login failed. Please try again.'
        );
      }
    });
  }
}
