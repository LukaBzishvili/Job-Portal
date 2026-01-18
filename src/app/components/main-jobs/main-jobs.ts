import { Component } from '@angular/core';
import { MainJobCard } from '../cards/main-job-card/main-job-card';

@Component({
  selector: 'app-main-jobs',
  imports: [MainJobCard],
  templateUrl: './main-jobs.html',
  styleUrl: './main-jobs.scss',
})
export class MainJobs {}
