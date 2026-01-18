import { Component, signal } from '@angular/core';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { LoginProps } from '../../models/login';

@Component({
  selector: 'app-login-page',
  imports: [FormField],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
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
      const credentials = this.loginModel;
      console.log('Logging with: ', this.loginModel);
    });
  }
}
