import { Routes } from '@angular/router';
import { Main } from './layouts/main/main';
import { LoginPage } from './layouts/login-page/login-page';
import { RegisterPage } from './layouts/register-page/register-page';

export const routes: Routes = [
  { path: '', component: Main },
  { path: 'login', component: LoginPage },
  {
    path: 'register',
    component: RegisterPage,
  },
];
