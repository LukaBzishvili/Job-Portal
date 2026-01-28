import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyJobCard } from './company-job-card';

describe('CompanyJobCard', () => {
  let component: CompanyJobCard;
  let fixture: ComponentFixture<CompanyJobCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyJobCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyJobCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
