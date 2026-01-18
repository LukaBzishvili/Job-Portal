import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainTopCompanies } from './main-top-companies';

describe('MainTopCompanies', () => {
  let component: MainTopCompanies;
  let fixture: ComponentFixture<MainTopCompanies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainTopCompanies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainTopCompanies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
