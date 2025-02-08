import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAttachmentComponent } from './customer-attachment.component';

describe('CustomerAttachmentComponent', () => {
  let component: CustomerAttachmentComponent;
  let fixture: ComponentFixture<CustomerAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerAttachmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
