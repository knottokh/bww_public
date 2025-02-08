import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInprogressComponent } from './customer-inprogress.component';

describe('CustomerInprogressComponent', () => {
  let component: CustomerInprogressComponent;
  let fixture: ComponentFixture<CustomerInprogressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerInprogressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerInprogressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
