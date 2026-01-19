import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { auth } from '../../firebase/firebase';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  isHamburgerOpen = false;

  logOut() {
    auth.signOut();
  }

  handleHamburger() {
    this.isHamburgerOpen = !this.isHamburgerOpen;
  }
}
