import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBillsComponent } from './edit-bills.component';

describe('EditBillsComponent', () => {
  let component: EditBillsComponent;
  let fixture: ComponentFixture<EditBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditBillsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
