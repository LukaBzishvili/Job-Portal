import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsPageCard } from './jobs-page-card';

describe('JobsPageCard', () => {
  let component: JobsPageCard;
  let fixture: ComponentFixture<JobsPageCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobsPageCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobsPageCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
