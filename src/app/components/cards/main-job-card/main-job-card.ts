import { Component, Input, OnInit } from '@angular/core';
import { Company, JobType } from '../../../models/firestore';
import { Router, RouterLink } from '@angular/router';
import { auth } from '../../../firebase/firebase';
import { Firestore } from '../../../services/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-job-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './main-job-card.html',
  styleUrl: './main-job-card.scss',
})
export class MainJobCard implements OnInit {
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
    console.log(this.company);
  }

  private checkIfApplied() {
    const uid = auth.currentUser?.uid;
    this.isApplied = !!uid && (this.applicants ?? []).includes(uid);
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
      this.applicants = (this.applicants ?? []).filter((x) => x !== uid);
    }
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

  initials(name: string | undefined = '') {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0][0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }
}
