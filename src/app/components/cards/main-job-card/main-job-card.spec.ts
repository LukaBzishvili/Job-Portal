import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainJobCard } from './main-job-card';

describe('MainJobCard', () => {
  let component: MainJobCard;
  let fixture: ComponentFixture<MainJobCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainJobCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainJobCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
