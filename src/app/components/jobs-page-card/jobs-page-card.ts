import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { JobType } from '../../models/firestore';

@Component({
  selector: 'app-jobs-page-card',
  imports: [RouterLink],
  templateUrl: './jobs-page-card.html',
  styleUrl: './jobs-page-card.scss',
})
export class JobsPageCard {
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
