import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicCompanyPage } from './public-company-page';

describe('PublicCompanyPage', () => {
  let component: PublicCompanyPage;
  let fixture: ComponentFixture<PublicCompanyPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicCompanyPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicCompanyPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
