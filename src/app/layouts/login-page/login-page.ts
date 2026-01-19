import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { LoginProps } from '../../models/login';
import { Auth as AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [FormField],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  loginModel = signal<LoginProps>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (a) => {
    required(a.email, { message: 'Email is required' });
    email(a.email, { message: 'Enter valid email address' });

    required(a.password, { message: 'Password is required' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.loginForm, async () => {
      const credentials = this.loginModel();
      console.log('Logging with: ', credentials);
      try {
        await this.auth.signIn(credentials.email, credentials.password);
        await this.router.navigate(['/']);
      } catch (error) {
        console.error('Error during sign in:', error);
      }
    });
  }
}
