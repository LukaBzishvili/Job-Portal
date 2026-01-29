import { Component, Input } from '@angular/core';
import { Company, JobType } from '../../models/firestore';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-job-card',
  imports: [RouterLink, CommonModule],
  templateUrl: './company-job-card.html',
  styleUrl: './company-job-card.scss',
})
export class CompanyJobCard {
  constructor(private router: Router) {}

  @Input() title?: string;
  @Input() jobType?: JobType;
  @Input() salary?: number | string;
  @Input() applicants?: string[];
  @Input() link?: string;
  @Input() createdAt?: any;
  @Input() updatedAt?: any;
  @Input() id?: string;
  @Input() currency?: string;
  // @Input() company?: string;
  // @Input() companyLocation?: string;
  // @Input() logoURL?: string;
  @Input() company?: Company;

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

  initials(name: string | undefined = '') {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0][0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }
}
