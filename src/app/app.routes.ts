import { Routes } from '@angular/router';
import { Main } from './layouts/main/main';
import { LoginPage } from './layouts/login-page/login-page';
import { RegisterPage } from './layouts/register-page/register-page';
import { authGuard } from './guards/auth-guard';
import { JobsPage } from './layouts/jobs-page/jobs-page';
import { Profile } from './layouts/profile/profile';
import { companyGuard } from './guards/company-guard';
import { CompanyPage } from './layouts/company-page/company-page';
import { VacancyPage } from './layouts/vacancy-page/vacancy-page';
import { AddJobPage } from './layouts/add-job-page/add-job-page';
import { Employers } from './layouts/employers/employers';

export const routes: Routes = [
  { path: '', component: Main },
  { path: 'login', canActivate: [authGuard], component: LoginPage },
  {
    path: 'register',
    canActivate: [authGuard],
    component: RegisterPage,
  },
  {
    path: 'jobs',
    component: JobsPage,
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    component: Profile,
  },
  {
    path: 'company',
    canActivate: [companyGuard],
    component: CompanyPage,
  },
  {
    path: 'vacancy/:id',
    component: VacancyPage,
  },
  { path: 'post-job', component: AddJobPage, canActivate: [companyGuard] },
  { path: 'employers', component: Employers },
];
