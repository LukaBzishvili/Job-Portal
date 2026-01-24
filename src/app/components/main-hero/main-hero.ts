import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-hero',
  imports: [FormsModule],
  templateUrl: './main-hero.html',
  styleUrl: './main-hero.scss',
})
export class MainHero {
  searchJobs: string = '';
  searchLocation: string = '';

  constructor(private router: Router) {}

  searchForResults() {
    this.router.navigate(['/jobs'], {
      queryParams: {
        q: this.searchJobs.trim() || null,
        location: this.searchLocation.trim() || null,
      },
    });
  }
}
