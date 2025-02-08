import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSharelinkComponent } from './customer-sharelink.component';

describe('CustomerSharelinkComponent', () => {
  let component: CustomerSharelinkComponent;
  let fixture: ComponentFixture<CustomerSharelinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerSharelinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSharelinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
