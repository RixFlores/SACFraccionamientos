import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditIncomesComponent } from './edit-incomes.component';

describe('EditIncomesComponent', () => {
  let component: EditIncomesComponent;
  let fixture: ComponentFixture<EditIncomesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditIncomesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditIncomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
