import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore } from '../../services/firestore';
import { Job } from '../../models/firestore';
import { LoadingScreen } from '../../components/loading-screen/loading-screen';
import { MainJobCard } from '../../components/cards/main-job-card/main-job-card';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type CompanyForm = {
  name: string;
  website: string;
  logoURL: string;
  industry: string;
  size: string;
  description: string;
  city: string;
  country: string;
};

@Component({
  selector: 'app-company-page',
  standalone: true,
  imports: [CommonModule, LoadingScreen, MainJobCard, FormsModule, RouterLink],
  templateUrl: './company-page.html',
  styleUrl: './company-page.scss',
})
export class CompanyPage implements OnInit {
  private fs = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  isLoading = signal(true);
  isSaving = signal(false);

  jobs = signal<Job[]>([]);
  company = signal<any | null>(null);

  companyForm = signal<CompanyForm>({
    name: '',
    website: '',
    logoURL: '',
    industry: '',
    size: '',
    description: '',
    city: '',
    country: '',
  });

  async ngOnInit() {
    try {
      const [company, jobs] = await Promise.all([
        this.fs.getCurrentCompany(),
        this.fs.listJobsForCurrentCompany(),
      ]);

      this.company.set(company);
      this.jobs.set(jobs);

      if (company) {
        this.companyForm.set({
          name: company.name ?? '',
          website: company.website ?? '',
          logoURL: company.logoURL ?? '',
          industry: company.industry ?? '',
          size: company.size ?? '',
          description: company.description ?? '',
          city: company.location?.city ?? '',
          country: company.location?.country ?? '',
        });
      }
    } catch (e) {
      console.error('Failed to load company page data', e);
      this.company.set(null);
      this.jobs.set([]);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  async saveCompany() {
    const v = this.companyForm();

    if (!v.name.trim()) {
      return;
    }

    this.isSaving.set(true);
    try {
      await this.fs.updateCurrentCompany({
        name: v.name.trim(),
        website: v.website.trim() || null,
        logoURL: v.logoURL.trim() || null,
        industry: v.industry.trim() || null,
        size: v.size.trim() || null,
        description: v.description.trim() || null,
        location: {
          city: v.city.trim() || null,
          country: v.country.trim() || null,
        },
      });

      const updated = await this.fs.getCurrentCompany();
      this.company.set(updated);
    } catch (e) {
      console.error('Failed to save company profile', e);
    } finally {
      this.isSaving.set(false);
      this.cdr.markForCheck();
    }
  }

  isEmpty(val: any) {
    return val == null || String(val).trim() === '';
  }

  setCompanyField<K extends keyof CompanyForm>(key: K, value: CompanyForm[K]) {
    this.companyForm.update((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  setCompanyLocationField(key: 'city' | 'country', value: string) {
    this.companyForm.update((prev) => ({
      ...prev,
      [key]: value,
    }));
  }
}
