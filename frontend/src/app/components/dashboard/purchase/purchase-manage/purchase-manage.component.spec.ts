import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseManageComponent } from './purchase-manage.component';

describe('PurchaseManageComponent', () => {
  let component: PurchaseManageComponent;
  let fixture: ComponentFixture<PurchaseManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
