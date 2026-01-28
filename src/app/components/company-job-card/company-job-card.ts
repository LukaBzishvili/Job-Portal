import { Component, Input } from '@angular/core';
import { JobType } from '../../models/firestore';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-company-job-card',
  imports: [RouterLink],
  templateUrl: './company-job-card.html',
  styleUrl: './company-job-card.scss',
})
export class CompanyJobCard {
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
  @Input() id?: string;
  @Input() currency: string | undefined;

  cutText(text: string | undefined, maxLength: number): string {
    if (!text) return '';

    if (text.length <= maxLength) {
      return text;
    }

    return text.slice(0, maxLength) + '...';
  }

  navigateToJobLink() {
    if (this.link) {
      this.router.navigateByUrl(this.link);
    }
  }
}
