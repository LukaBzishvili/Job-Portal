import { ChangeDetectorRef, Component } from '@angular/core';
import { Firestore } from '../../services/firestore';
import { Company } from '../../models/firestore';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoadingService } from '../../services/loading-service';

@Component({
  selector: 'app-main-top-companies',
  imports: [CommonModule, RouterLink],
  templateUrl: './main-top-companies.html',
  styleUrl: './main-top-companies.scss',
})
export class MainTopCompanies {
  companies: Company[] = [];
  constructor(
    private fs: Firestore,
    private loading: LoadingService,
    private cdr: ChangeDetectorRef,
  ) {
    fs.listMainPageCompanies().then((companies) => {
      this.companies = companies;
      this.cdr.markForCheck();
      this.loading.end();
    });
  }
}
