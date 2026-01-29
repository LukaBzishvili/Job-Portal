import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Company, JobType } from '../../models/firestore';
import { auth } from '../../firebase/firebase';
import { Firestore } from '../../services/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jobs-page-card',
  imports: [RouterLink, CommonModule],
  templateUrl: './jobs-page-card.html',
  styleUrl: './jobs-page-card.scss',
})
export class JobsPageCard {
  constructor(
    private router: Router,
    private fs: Firestore,
  ) {}

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

  isApplied = false;

  ngOnInit() {
    this.checkIfApplied();
  }

  private checkIfApplied() {
    const user = auth.currentUser;
    if (!user || !this.applicants?.length) {
      this.isApplied = false;
      return;
    }

    this.isApplied = this.applicants.includes(user.uid);
  }

  cutText(text?: string, maxLength = 30): string {
    if (!text) return '';
    return text.length <= maxLength ? text : text.slice(0, maxLength) + '...';
  }

  navigateToJobLink() {
    if (this.link) {
      this.router.navigateByUrl(this.link);
    }
  }

  async apply() {
    if (!this.id || this.isApplied) return;

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    this.isApplied = true;
    this.applicants = [...(this.applicants ?? []), uid];

    try {
      await this.fs.applyToJob(this.id);
    } catch (err) {
      console.error(err);
      this.isApplied = false;
      this.applicants = (this.applicants ?? []).filter((id) => id !== uid);
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
