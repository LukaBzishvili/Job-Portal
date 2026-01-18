import { Component } from '@angular/core';
import { MainHero } from '../../components/main-hero/main-hero';
import { MainJobs } from '../../components/main-jobs/main-jobs';
import { MainTopCompanies } from '../../components/main-top-companies/main-top-companies';

@Component({
  selector: 'app-main',
  imports: [MainHero, MainJobs, MainTopCompanies],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {}
