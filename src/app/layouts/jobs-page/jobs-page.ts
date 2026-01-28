import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore } from '../../services/firestore';
import { LoadingScreen } from '../../components/loading-screen/loading-screen';
import { Filter, Job } from '../../models/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { JobsPageCard } from '../../components/jobs-page-card/jobs-page-card';

@Component({
  selector: 'app-jobs-page',
  imports: [JobsPageCard, CommonModule, LoadingScreen, FormsModule],
  templateUrl: './jobs-page.html',
  styleUrl: './jobs-page.scss',
})
export class JobsPage implements OnInit {
  filters: Filter[] = [];
  jobs: Job[] = [];

  searchJobs: string = '';
  searchLocation: string = '';

  private allJobs: Job[] = [];
  private sub?: Subscription;

  isLoading = signal(true);

  constructor(
    private fs: Firestore,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  searchJobsAndLocation() {
    const q = this.searchJobs.trim() || null;
    const location = this.searchLocation.trim() || null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q, location },
      queryParamsHandling: 'merge',
    });
  }

  getFilterOptions(filter: any): string[] {
    return Object.keys(filter).filter((k) => k !== 'id' && k !== 'open');
  }

  toggleOption(filter: any, key: string, checked: boolean) {
    const safeKey = filter.id.replace(/\s+/g, '');
    const value = String(filter[key]).replace(/^\//, '');

    const current = this.route.snapshot.queryParamMap.getAll(safeKey);

    if (checked && value === '') {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { [safeKey]: null },
        queryParamsHandling: 'merge',
      });
      return;
    }

    const cleanedCurrent = current.filter((v) => v !== '');

    const next = checked
      ? Array.from(new Set([...cleanedCurrent, value]))
      : cleanedCurrent.filter((v) => v !== value);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        [safeKey]: next.length ? next : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  clearFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  async ngOnInit() {
    const [filters, jobs] = await Promise.all([this.fs.listFilters(), this.fs.listJobs()]);

    this.allJobs = jobs;
    this.filters = filters;
    this.jobs = jobs;

    const snap = this.route.snapshot.queryParamMap;
    this.searchJobs = snap.get('q') ?? '';
    this.searchLocation = snap.get('location') ?? '';

    this.isLoading.set(false);
    this.cdr.markForCheck();

    this.sub = this.route.queryParamMap.subscribe(async (map) => {
      const urlQ = map.get('q') ?? '';
      const urlLocation = map.get('location') ?? '';

      if (this.searchJobs !== urlQ) this.searchJobs = urlQ;
      if (this.searchLocation !== urlLocation) this.searchLocation = urlLocation;

      const hasFilterParams = map.keys.some((k) => {
        if (k === 'q' || k === 'location') return false;

        const values = map.getAll(k);
        return values.length > 0 && !values.includes('');
      });

      const hasSearch = !!urlQ.trim() || !!urlLocation.trim();
      const shouldFilter = hasFilterParams || hasSearch;

      if (!shouldFilter) {
        this.jobs = this.allJobs;
        this.cdr.markForCheck();
        return;
      }

      this.isLoading.set(true);
      this.cdr.markForCheck();

      this.jobs = await this.fs.listJobsByQueryParams(map);

      this.isLoading.set(false);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  isChecked(filter: any, key: string): boolean {
    const safeKey = filter.id.replace(/\s+/g, '');
    const value = String(filter[key]).replace(/^\//, '');

    const selected = this.route.snapshot.queryParamMap.getAll(safeKey);

    if (value === '') return selected.length === 0;

    return selected.includes(value);
  }
}
