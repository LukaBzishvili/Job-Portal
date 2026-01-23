import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private pending = signal(0);
  private visible = signal(false);
  private readonly hideDelayMs = 250;
  private hideTimer: any = null;
  readonly isLoading = computed(() => this.visible());

  start() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.pending.update((n) => n + 1);
    this.visible.set(true);
  }

  end() {
    this.pending.update((n) => Math.max(0, n - 1));
    if (this.pending() === 0) {
      if (this.hideTimer) clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => {
        if (this.pending() === 0) this.visible.set(false);
        this.hideTimer = null;
      }, this.hideDelayMs);
    }
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
