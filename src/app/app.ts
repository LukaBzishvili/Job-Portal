import { Component, signal, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';
import { LoadingScreen } from './components/loading-screen/loading-screen';
import { auth } from './firebase/firebase';
import { onAuthStateChanged, Unsubscribe } from 'firebase/auth';
import { LoadingService } from './services/loading-service';
import { UserStore } from './stores/user.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, LoadingScreen],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  isLoggedIn = signal(false);
  private unsubAuth?: Unsubscribe;

  constructor(
    public loading: LoadingService,
    private userStore: UserStore,
  ) {
    this.loading.track(
      new Promise<void>((resolve) => {
        this.unsubAuth = onAuthStateChanged(auth, (user) => {
          this.isLoggedIn.set(!!user);
          resolve();
        });
      }),
    );
  }

  ngOnDestroy(): void {
    this.unsubAuth?.();
  }
}
