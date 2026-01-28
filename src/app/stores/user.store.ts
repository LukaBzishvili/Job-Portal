import { Injectable, computed, inject, signal } from '@angular/core';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Auth } from '../services/auth';

type AccountType = 'candidate' | 'company';

type AppUser = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: number | null;
  accountType?: AccountType;
  companyId?: string | null;
};

@Injectable({ providedIn: 'root' })
export class UserStore {
  private auth = inject(Auth);

  user = signal<AppUser | null>(null);

  loading = signal(true);

  isLoggedIn = computed(() => !!this.user());
  isCompany = computed(() => this.user()?.accountType === 'company');

  private unsubscribeProfile?: () => void;

  constructor() {
    this.auth.onAuthStateChange((firebaseUser) => {
      if (this.unsubscribeProfile) {
        this.unsubscribeProfile();
        this.unsubscribeProfile = undefined;
      }

      if (!firebaseUser) {
        this.user.set(null);
        this.loading.set(false);
        return;
      }

      this.loading.set(true);

      const ref = doc(db, 'users', firebaseUser.uid);

      this.unsubscribeProfile = onSnapshot(
        ref,
        (snap) => {
          if (snap.exists()) {
            this.user.set({ id: snap.id, ...(snap.data() as any) });
          } else {
            this.user.set(null);
          }
          this.loading.set(false);
        },
        (error) => {
          console.error('User profile load failed', error);
          this.user.set(null);
          this.loading.set(false);
        },
      );
    });
  }
}
