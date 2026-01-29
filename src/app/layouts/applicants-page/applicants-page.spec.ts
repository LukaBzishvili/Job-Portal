import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantsPage } from './applicants-page';

describe('ApplicantsPage', () => {
  let component: ApplicantsPage;
  let fixture: ComponentFixture<ApplicantsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
