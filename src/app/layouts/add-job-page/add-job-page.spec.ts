import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddJobPage } from './add-job-page';

describe('AddJobPage', () => {
  let component: AddJobPage;
  let fixture: ComponentFixture<AddJobPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddJobPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddJobPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
