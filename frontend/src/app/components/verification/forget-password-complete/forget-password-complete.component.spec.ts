import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetPasswordCompleteComponent } from './forget-password-complete.component';

describe('ForgetPasswordCompleteComponent', () => {
  let component: ForgetPasswordCompleteComponent;
  let fixture: ComponentFixture<ForgetPasswordCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgetPasswordCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgetPasswordCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
