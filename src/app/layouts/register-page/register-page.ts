import { Component, inject, signal } from '@angular/core';
import { RegisterProps } from '../../models/register';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Auth as AuthService } from '../../services/auth';
import { Firestore } from '../../services/firestore';
import { LoadingScreen } from '../../components/loading-screen/loading-screen';

@Component({
  selector: 'app-register-page',
  imports: [FormField, LoadingScreen],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fs = inject(Firestore);
  isLoading = signal(false);

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
    this.isLoading.set(true);

    submit(this.registerForm, async () => {
      const credentials = this.registerModel();

      try {
        const usr = await this.auth.signUp(credentials.email, credentials.password);

        await this.fs.addUser(usr.uid, {
          fullName: credentials.fullName,
          email: credentials.email,
          phoneNumber: credentials.phoneNumber,
        });

        await this.router.navigate(['/']);

        this.isLoading.set(false);
      } catch (error) {
        console.error('Error during sign up:', error);
        this.isLoading.set(false);
      }
    });
  }
}
