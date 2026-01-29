import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Firestore } from '../../services/firestore';
import { Job, Company } from '../../models/firestore';
import { LoadingScreen } from '../../components/loading-screen/loading-screen';
import { CompanyJobCard } from '../../components/company-job-card/company-job-card';

@Component({
  selector: 'app-public-company-page',
  imports: [CommonModule, LoadingScreen, CompanyJobCard],
  templateUrl: './public-company-page.html',
  styleUrl: './public-company-page.scss',
})
export class PublicCompanyPage implements OnInit {
  private fs = inject(Firestore);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  isLoading = signal(true);
  company = signal<Company | null>(null);
  jobs = signal<Job[]>([]);

  async ngOnInit() {
    const companyId = this.route.snapshot.paramMap.get('id');

    if (!companyId) {
      this.company.set(null);
      this.jobs.set([]);
      this.isLoading.set(false);
      return;
    }

    try {
      const [company, jobs] = await Promise.all([
        this.fs.getCompanyById(companyId),
        this.fs.listJobsByCompanyId(companyId),
      ]);

      this.company.set(company);
      this.jobs.set(jobs);
    } catch (e) {
      console.error('Failed to load public company page', e);
      this.company.set(null);
      this.jobs.set([]);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  logoError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    img.parentElement?.classList.add('fallback');
  }

  initials(name: string) {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0][0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }
}
