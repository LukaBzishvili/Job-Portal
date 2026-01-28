import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { UserStore } from '../../stores/user.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(Auth);
  private userStore = inject(UserStore);

  // fast auth state comes from App (no flicker)
  @Input() isLoggedIn = false;

  // company role comes from Firestore profile (via store)
  isCompany = this.userStore.isCompany;
  profileLoading = this.userStore.loading;

  isHamburgerOpen = false;

  logOut() {
    this.authService.signOutUser();
  }

  handleHamburger() {
    this.isHamburgerOpen = !this.isHamburgerOpen;
  }
}
