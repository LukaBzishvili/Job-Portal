import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore } from '../../services/firestore';
import { LoadingService } from '../../services/loading-service';
import {
  ExperienceLevel,
  Job,
  JobFunction,
  JobType,
  WorkMode,
  Currency,
} from '../../models/firestore';

@Component({
  selector: 'app-add-job-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-job-page.html',
  styleUrl: './add-job-page.scss',
})
export class AddJobPage implements OnInit {
  jobFunctions: { label: string; value: JobFunction }[] = [
    { label: 'Marketing', value: 'marketing' },
    { label: 'Engineering', value: 'engineering' },
    { label: 'Design', value: 'design' },
    { label: 'Sales', value: 'sales' },
    { label: 'Customer Service', value: 'customer-service' },
  ];

  experienceLevels: { label: string; value: ExperienceLevel }[] = [
    { label: 'Entry', value: 'entry' },
    { label: 'Junior', value: 'junior' },
    { label: 'Middle', value: 'middle' },
    { label: 'Senior', value: 'senior' },
    { label: 'Lead', value: 'lead' },
    { label: 'Director', value: 'director' },
  ];

  jobTypes: { label: string; value: JobType }[] = [
    { label: 'Full-time', value: 'full-time' },
    { label: 'Part-time', value: 'part-time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Internship', value: 'internship' },
    { label: 'Temporary', value: 'temporary' },
  ];

  workModes: { label: string; value: WorkMode }[] = [
    { label: 'Remote', value: 'remote' },
    { label: 'On-site', value: 'on-site' },
    { label: 'Hybrid', value: 'hybrid' },
  ];

  currencyOptions: { label: string; value: Currency }[] = [
    { label: 'GEL', value: 'GEL' },
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'GBP', value: 'GBP' },
    { label: 'INR', value: 'INR' },
  ];

  companyId: string | null = null;
  companyName: string | null = null;
  companyLocationText: string | null = null;

  error: string | null = null;
  success: string | null = null;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private fs: Firestore,
    public loading: LoadingService,
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      tags: [''],

      jobFunction: ['marketing' as JobFunction, Validators.required],
      jobType: ['full-time' as JobType, Validators.required],
      workMode: ['remote' as WorkMode, Validators.required],
      experienceLevel: ['junior' as ExperienceLevel, Validators.required],

      minSalary: [''],
      maxSalary: [''],

      currency: ['GEL' as Currency, Validators.required],

      country: [''],
      city: [''],

      link: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const company = await this.loading.track(this.fs.getCurrentCompany());
      const companyId = await this.loading.track(this.fs.getCurrentCompanyId());

      this.companyId = companyId;
      this.companyName = company?.name ?? null;

      const country = company?.location?.country ?? null;
      const city = company?.location?.city ?? null;
      this.companyLocationText = [city, country].filter(Boolean).join(', ') || null;

      if (country) this.form.patchValue({ country });
      if (city) this.form.patchValue({ city });
    } catch (e: any) {
      this.error = e?.message ?? 'Failed to load company profile.';
    }
  }

  private buildSalary(minRaw: any, maxRaw: any): number | string {
    const min = Number(String(minRaw ?? '').trim());
    const max = Number(String(maxRaw ?? '').trim());

    const minOk = Number.isFinite(min) && min > 0;
    const maxOk = Number.isFinite(max) && max > 0;

    if (minOk && maxOk) return `${min} - ${max}`;
    if (minOk) return min;
    if (maxOk) return max;

    return '—';
  }

  private buildCompanyLocation(): string {
    const country = (this.form.value.country ?? '').toString().trim();
    const city = (this.form.value.city ?? '').toString().trim();
    const fromForm = [city, country].filter(Boolean).join(', ');
    return fromForm || this.companyLocationText || '—';
  }

  isInvalid(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.touched && c.invalid;
  }

  get selectedCurrency(): Currency {
    return (this.form.value.currency as Currency) ?? 'GEL';
  }

  async submit(): Promise<void> {
    this.error = null;
    this.success = null;

    if (!this.companyId) {
      this.error = 'No companyId linked to this user. Create/attach a company account first.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const salary = this.buildSalary(this.form.value.minSalary, this.form.value.maxSalary);

    const jobPayload: Omit<Job, 'createdAt' | 'updatedAt'> = {
      companyId: this.companyId,
      title: (this.form.value.title ?? '').trim(),
      company: this.companyName ?? '—',
      companyLocation: this.buildCompanyLocation(),

      salary,
      currency: this.selectedCurrency,

      link: (this.form.value.link ?? '').trim(),
      applicants: [],

      jobFunction: this.form.value.jobFunction!,
      experienceLevel: this.form.value.experienceLevel!,
      jobType: this.form.value.jobType!,
      workMode: this.form.value.workMode!,

      description: (this.form.value.description ?? '').trim(),
    };

    try {
      const docRef = await this.loading.track(this.fs.addJob(jobPayload));
      this.success = 'Job posted successfully!';
      // console.log('Job created with id:', docRef.id);

      this.form.patchValue({
        title: '',
        tags: '',
        minSalary: '',
        maxSalary: '',
        link: '',
        description: '',
      });
      this.form.markAsPristine();
      this.form.markAsUntouched();
    } catch (e: any) {
      this.error = e?.message ?? 'Failed to post job.';
    }
  }
}
