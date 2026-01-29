import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Firestore } from '../../services/firestore';
import { LoadingService } from '../../services/loading-service';
import { LoadingScreen } from '../../components/loading-screen/loading-screen';
import { Job, User } from '../../models/firestore';

@Component({
  selector: 'app-applicants-page',
  standalone: true,
  imports: [CommonModule, LoadingScreen, RouterLink],
  templateUrl: './applicants-page.html',
  styleUrl: './applicants-page.scss',
})
export class ApplicantsPage implements OnInit {
  job: Job | null = null;
  applicants: User[] = [];
  canView = false;

  constructor(
    private fs: Firestore,
    private route: ActivatedRoute,
    private router: Router,
    public loading: LoadingService,
  ) {}

  ngOnInit(): void {
    const jobId =
      this.route.snapshot.paramMap.get('jobId') || this.route.snapshot.paramMap.get('id') || '';

    if (!jobId) {
      this.router.navigate(['/']);
      return;
    }

    this.load(jobId);
  }

  private async load(jobId: string) {
    const job = await this.loading.track(this.fs.getSpecificJob(jobId));
    this.job = job;

    if (!job) {
      this.canView = false;
      this.applicants = [];
      return;
    }

    if (!job.companyId) {
      this.canView = false;
      this.applicants = [];
      return;
    }

    const profile = await this.loading.track(this.fs.getCurrentUserProfile());
    const accountType = (profile as any)?.accountType as 'candidate' | 'company' | undefined;
    const viewerCompanyId = (profile as any)?.companyId as string | undefined;

    this.canView =
      accountType === 'company' && !!viewerCompanyId && viewerCompanyId === job.companyId;

    if (!this.canView) {
      this.router.navigate(['/vacancy', jobId]);
      return;
    }

    const ids = Array.isArray(job.applicants) ? job.applicants : [];
    this.applicants = ids.length ? await this.loading.track(this.fs.getUsersByIds(ids)) : [];
  }
}
