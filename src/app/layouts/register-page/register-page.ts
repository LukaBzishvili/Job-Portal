import { Component, inject, signal } from '@angular/core';
import { RegisterProps } from '../../models/register';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Auth as AuthService } from '../../services/auth';

@Component({
  selector: 'app-register-page',
  imports: [FormField],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  registerModel = signal<RegisterProps>({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: 0,
  });

  registerForm = form(this.registerModel, (a) => {
    required(a.fullName, { message: 'Full name is required' });

    required(a.email, { message: 'Email is required' });
    email(a.email, { message: 'Enter a valid email' });

    required(a.password, { message: 'Password is required' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.registerForm, async () => {
      const credentials = this.registerModel();
      console.log('registering with: ', credentials);
      try {
        await this.auth.signUp(credentials.email, credentials.password);
        await this.router.navigate(['/']);
      } catch (error) {
        console.error('Error during sign up:', error);
      }
    });
  }
}
