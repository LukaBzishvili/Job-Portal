import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MainJobCard } from '../cards/main-job-card/main-job-card';
import { LoadingService } from '../../services/loading-service';
import { Firestore } from '../../services/firestore';
import { Job } from '../../models/firestore';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main-jobs',
  imports: [MainJobCard, CommonModule, RouterLink],
  templateUrl: './main-jobs.html',
  styleUrl: './main-jobs.scss',
})
export class MainJobs {
  jobs: Job[] = [];
  constructor(
    private fs: Firestore,
    private loading: LoadingService,
    private cdr: ChangeDetectorRef,
  ) {
    fs.listMainPageJobs().then((jobs) => {
      this.jobs = jobs;
      this.cdr.markForCheck();
      this.loading.end();
    });
  }
}
