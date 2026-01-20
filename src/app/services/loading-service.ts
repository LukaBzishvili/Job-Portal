import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private pending = signal(0);
  readonly isLoading = computed(() => this.pending() > 0);

  start() {
    this.pending.update((n) => n + 1);
  }

  end() {
    this.pending.update((n) => Math.max(0, n - 1));
  }

  async track<T>(p: Promise<T>): Promise<T> {
    this.start();
    try {
      return await p;
    } finally {
      this.end();
    }
  }
}
