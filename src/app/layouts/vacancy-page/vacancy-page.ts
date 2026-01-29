import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Job } from '../../models/firestore';
import { Firestore } from '../../services/firestore';
import { LoadingService } from '../../services/loading-service';
import { LoadingScreen } from '../../components/loading-screen/loading-screen';
import { auth } from '../../firebase/firebase';

@Component({
  selector: 'app-vacancy-page',
  standalone: true,
  imports: [CommonModule, LoadingScreen],
  templateUrl: './vacancy-page.html',
  styleUrl: './vacancy-page.scss',
})
export class VacancyPage implements OnInit {
  vacancy: Job | null = null;
  auth = auth;
  canViewApplicants = false;

  constructor(
    private fs: Firestore,
    private route: ActivatedRoute,
    private router: Router,

    public loading: LoadingService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';

    this.loading.track(this.fs.getSpecificJob(id)).then(async (job) => {
      this.vacancy = job;
      // console.log(job);

      const profile = await this.fs.getCurrentUserProfile();
      const accountType = (profile as any)?.accountType as 'candidate' | 'company' | undefined;
      const viewerCompanyId = (profile as any)?.companyId as string | undefined;

      this.canViewApplicants =
        accountType === 'company' &&
        !!viewerCompanyId &&
        !!job?.companyId &&
        viewerCompanyId === job.companyId;
    });
  }

  goToApplicants() {
    if (!this.vacancy?.id) return;
    this.router.navigate(['/vacancy', this.vacancy.id, 'applicants']);
  }

  formatDate(value: any): string {
    if (!value) return '—';
    if (typeof value === 'object' && 'seconds' in value) {
      return new Date(value.seconds * 1000).toLocaleString();
    }
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString();
  }

  prettify(value: any): string {
    if (!value) return '—';
    return String(value)
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  async apply() {
    if (!this.vacancy?.id) return;

    await this.loading.track(this.fs.applyToJob(this.vacancy.id));

    const uid = auth.currentUser?.uid;
    if (uid && !this.vacancy.applicants?.includes(uid)) {
      this.vacancy = {
        ...this.vacancy,
        applicants: [...(this.vacancy.applicants ?? []), uid],
      };
    }
  }
}
