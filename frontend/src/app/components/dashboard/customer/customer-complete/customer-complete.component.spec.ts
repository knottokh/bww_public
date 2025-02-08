import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCompleteComponent } from './customer-complete.component';

describe('CustomerCompleteComponent', () => {
  let component: CustomerCompleteComponent;
  let fixture: ComponentFixture<CustomerCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
