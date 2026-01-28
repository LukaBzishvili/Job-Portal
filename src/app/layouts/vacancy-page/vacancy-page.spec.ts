import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacancyPage } from './vacancy-page';

describe('VacancyPage', () => {
  let component: VacancyPage;
  let fixture: ComponentFixture<VacancyPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacancyPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VacancyPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
