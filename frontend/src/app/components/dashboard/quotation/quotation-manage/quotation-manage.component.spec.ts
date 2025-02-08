import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { QuotationManageComponent } from "./quotation-manage.component";

describe("QuotationDetailComponent", () => {
  let component: QuotationManageComponent;
  let fixture: ComponentFixture<QuotationManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QuotationManageComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotationManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
