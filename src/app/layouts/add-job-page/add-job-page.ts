import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Firestore } from '../../services/firestore';
import { LoadingService } from '../../services/loading-service';
import {
  ExperienceLevel,
  Job,
  JobFunction,
  JobType,
  WorkMode,
  Currency,
  Company,
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
  company: Company | null = null;

  error: string | null = null;
  success: string | null = null;

  form: FormGroup;

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
      this.company = company;
    } catch (e: any) {
      this.error = e?.message ?? 'Failed to load company profile.';
    }
  }

  ctrl(name: string): AbstractControl | null {
    return this.form.get(name);
  }

  isInvalid(name: string): boolean {
    const c = this.ctrl(name);
    return !!c && c.touched && c.invalid;
  }

  fieldError(name: string): string | null {
    const c = this.ctrl(name);
    if (!c || !c.touched || !c.errors) return null;

    if (c.errors['required']) return 'This field is required.';
    if (c.errors['minlength']) {
      const req = c.errors['minlength']?.requiredLength;
      return `Minimum ${req} characters required.`;
    }
    if (c.errors['maxlength']) {
      const req = c.errors['maxlength']?.requiredLength;
      return `Maximum ${req} characters allowed.`;
    }
    if (c.errors['pattern']) return 'Please enter a valid value.';
    return 'Invalid value.';
  }

  private scrollToFirstInvalid(): void {
    const el = document.querySelector('.input.invalid, .editor-area.invalid, select.input.invalid');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    (el as HTMLElement | null)?.focus?.();
  }

  get selectedCurrency(): Currency {
    return (this.form.value.currency as Currency) ?? 'GEL';
  }

  private buildSalary(minRaw: any, maxRaw: any): number | string | null {
    const min = Number(String(minRaw ?? '').trim());
    const max = Number(String(maxRaw ?? '').trim());

    const minOk = Number.isFinite(min) && min > 0;
    const maxOk = Number.isFinite(max) && max > 0;

    if (minOk && maxOk) return `${min} - ${max}`;
    if (minOk) return min;
    if (maxOk) return max;

    return null;
  }

  async submit(): Promise<void> {
    this.error = null;
    this.success = null;

    if (!this.companyId || !this.company) {
      this.error = 'Company profile is not loaded. Cannot add job.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Please fix the highlighted fields before posting the job.';
      this.scrollToFirstInvalid();
      return;
    }

    const salary = this.buildSalary(this.form.value.minSalary, this.form.value.maxSalary);

    const jobPayload: Omit<Job, 'createdAt' | 'updatedAt'> & { tags?: string } = {
      companyId: this.companyId,
      title: (this.form.value.title ?? '').trim(),
      company: this.company,

      location:
        this.form.value.country || this.form.value.city
          ? {
              country: (this.form.value.country ?? '').trim(),
              city: (this.form.value.city ?? '').trim(),
            }
          : { country: '', city: '' },

      salary: salary ?? '',
      currency: this.selectedCurrency,

      link: (this.form.value.link ?? '').trim(),
      applicants: [],
      tags: (this.form.value.tags ?? '').trim(),

      jobFunction: this.form.value.jobFunction!,
      experienceLevel: this.form.value.experienceLevel!,
      jobType: this.form.value.jobType!,
      workMode: this.form.value.workMode!,

      description: (this.form.value.description ?? '').trim(),
    };

    try {
      const docRef = await this.loading.track(this.fs.addJob(jobPayload as any));
      this.success = 'Job posted successfully!';
      // console.log('Job created with id:', docRef.id);

      this.form.reset({
        title: '',
        tags: '',
        jobFunction: 'marketing',
        jobType: 'full-time',
        workMode: 'remote',
        experienceLevel: 'junior',
        minSalary: '',
        maxSalary: '',
        currency: 'GEL',
        country: '',
        city: '',
        link: '',
        description: '',
      });

      this.form.markAsPristine();
      this.form.markAsUntouched();
    } catch (e: any) {
      console.error('addJob failed:', e);
      this.error = e?.message ?? e?.code ?? 'Failed to post job.';
    }
  }
}
