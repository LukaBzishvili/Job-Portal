import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Auth as AuthService } from '../../services/auth';
import { Firestore } from '../../services/firestore';
import { LoadingScreen } from '../../components/loading-screen/loading-screen';

type AccountType = 'candidate' | 'company';

type RegisterModel = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: number;
  accountType: AccountType;
  companyName: string;
};

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

  registerModel = signal<RegisterModel>({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: 0,
    accountType: 'candidate',
    companyName: '',
  });

  registerForm = form(this.registerModel, (a) => {
    required(a.fullName, { message: 'Full name is required' });

    required(a.email, { message: 'Email is required' });
    email(a.email, { message: 'Enter a valid email' });

    required(a.password, { message: 'Password is required' });

    // Company name required only if accountType=company
    // (Angular signals forms doesn't have conditional validators out-of-the-box,
    // so we enforce it in onSubmit as well.)
  });

  setAccountType(type: AccountType) {
    this.registerModel.update((m) => ({
      ...m,
      accountType: type,
      companyName: type === 'company' ? m.companyName : '',
    }));
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);

    submit(this.registerForm, async () => {
      const credentials = this.registerModel();

      // Extra guard for company name
      if (credentials.accountType === 'company' && !credentials.companyName.trim()) {
        this.isLoading.set(false);
        return;
      }

      try {
        const usr = await this.auth.signUp(credentials.email, credentials.password);

        // ✅ One place handles both candidate & company creation
        await this.fs.registerUserWithOptionalCompany(usr.uid, {
          fullName: credentials.fullName,
          email: credentials.email,
          phoneNumber: credentials.phoneNumber,
          accountType: credentials.accountType,
          companyName: credentials.companyName,
        });

        await this.router.navigate(['/']);
      } catch (error) {
        console.error('Error during sign up:', error);
      } finally {
        this.isLoading.set(false);
      }
    });
  }
}
