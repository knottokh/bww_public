import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerViewtaskComponent } from './customer-viewtask.component';

describe('CustomerViewtaskComponent', () => {
  let component: CustomerViewtaskComponent;
  let fixture: ComponentFixture<CustomerViewtaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerViewtaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerViewtaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
