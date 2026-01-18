import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainJobs } from './main-jobs';

describe('MainJobs', () => {
  let component: MainJobs;
  let fixture: ComponentFixture<MainJobs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainJobs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainJobs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
