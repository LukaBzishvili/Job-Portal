import { Component, Input, input } from '@angular/core';
import { JobType } from '../../../models/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-job-card',
  imports: [],
  templateUrl: './main-job-card.html',
  styleUrl: './main-job-card.scss',
})
export class MainJobCard {
  constructor(private router: Router) {}

  @Input() title: string | undefined;
  @Input() jobType: JobType | undefined;
  @Input() salary: number | string | undefined;
  @Input() companyLocation: string | undefined;
  @Input() applicants: string[] | undefined;
  @Input() link: string | undefined;
  @Input() company: string | undefined;
  @Input() createdAt?: any;
  @Input() updatedAt?: any;

  navigateToJobLink() {
    if (this.link) {
      this.router.navigateByUrl(this.link);
    }
  }
}
