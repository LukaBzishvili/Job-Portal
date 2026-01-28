import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Company } from '../../models/firestore';

@Component({
  selector: 'app-employers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employers.html',
  styleUrl: './employers.scss',
})
export class Employers implements OnInit {
  isLoading = signal(true);
  error = signal<string | null>(null);

  companies = signal<Company[]>([]);
  search = signal('');

  async ngOnInit() {
    await this.loadCompanies();
  }

  async loadCompanies() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const q = query(collection(db, 'companies'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);

      this.companies.set(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Company, 'id'>) })),
      );
    } catch (e: any) {
      console.error(e);
      this.error.set(e?.message ?? 'Failed to load companies.');
    } finally {
      this.isLoading.set(false);
    }
  }

  filtered() {
    const term = this.search().trim().toLowerCase();
    const list = this.companies();
    if (!term) return list;

    return list.filter((c) => {
      const name = (c.name ?? '').toLowerCase();
      const industry = (c.industry ?? '').toLowerCase();
      const city = (c.location?.city ?? '').toLowerCase();
      const country = (c.location?.country ?? '').toLowerCase();
      return (
        name.includes(term) ||
        industry.includes(term) ||
        city.includes(term) ||
        country.includes(term)
      );
    });
  }

  openWebsite(url?: string | null) {
    if (!url) return;
    const fixed = url.startsWith('http') ? url : `https://${url}`;
    window.open(fixed, '_blank', 'noopener,noreferrer');
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

  trackById = (_: number, c: Company) => c.id;
}
