import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { MainJobCard } from '../../components/cards/main-job-card/main-job-card';
import { CommonModule } from '@angular/common';
import { Firestore } from '../../services/firestore';
import { LoadingScreen } from '../../components/loading-screen/loading-screen';
import { Filter, Job } from '../../models/firestore';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-jobs-page',
  imports: [MainJobCard, CommonModule, LoadingScreen],
  templateUrl: './jobs-page.html',
  styleUrl: './jobs-page.scss',
})
export class JobsPage implements OnInit {
  filters: Filter[] = [];
  jobs: Job[] = [];

  private allJobs: Job[] = [];
  private sub?: Subscription;

  isLoading = signal(true);

  constructor(
    private fs: Firestore,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    fs.listJobs().then((jobs) => {
      this.jobs = jobs;
      this.cdr.markForCheck();
    });
  }

  getFilterOptions(filter: any): string[] {
    return Object.keys(filter).filter((k) => k !== 'id' && k !== 'open');
  }

  toggleOption(filter: any, key: string, checked: boolean) {
    const safeKey = filter.id.replace(/\s+/g, '');
    const value = String(filter[key]).replace(/^\//, '');

    const current = this.route.snapshot.queryParamMap.getAll(safeKey);
    const next = checked
      ? Array.from(new Set([...current, value]))
      : current.filter((v) => v !== value);

    this.router.navigate([], {
      queryParams: {
        [safeKey]: next.length ? next : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  async ngOnInit() {
    const [filters, jobs] = await Promise.all([this.fs.listFilters(), this.fs.listJobs()]);

    this.allJobs = jobs;
    this.filters = filters;
    this.jobs = jobs;

    this.isLoading.set(false);

    this.sub = this.route.queryParamMap.subscribe(async (map) => {
      if (map.keys.length === 0) {
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

  ngonDestroy() {
    this.sub?.unsubscribe();
  }

  isChecked(filter: any, key: string): boolean {
    const safeKey = filter.id.replace(/\s+/g, '');
    const value = String(filter[key]).replace(/^\//, '');
    return this.route.snapshot.queryParamMap.getAll(safeKey).includes(value);
  }
}
