import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import {
  HttpClientModule,
  HTTP_INTERCEPTORS,
  HttpClient,
} from "@angular/common/http";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { ModalModule } from "ngx-bootstrap/modal";
import { ColorPickerModule } from "ngx-color-picker";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { OwlDateTimeModule, OwlNativeDateTimeModule } from "ng-pick-datetime";

import * as QuillNamespace from "quill";
const Quill: any = QuillNamespace;
import ImageResize from "quill-image-resize-module";
Quill.register("modules/imageResize", ImageResize);
import { QuillModule } from "ngx-quill";

import { FlexLayoutModule } from "@angular/flex-layout";

import { AppRoutingModule } from "./app-routing.module";
import { AppMaterialModule } from "./app-material.module";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxPrintModule } from "ngx-print";

import { CalendarModule, DateAdapter } from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";
import { NgxPaginationModule } from "ngx-pagination";
import { NgSelect2Module } from "ng-select2";

import { GoogleChartsModule } from "angular-google-charts";

// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

import {
  DashboardComponent,
  CustomerComponent,
  QuotationComponent,
  OrderComponent,
  PurchaseComponent,
  AccountingComponent,
  WarehouseComponent,
  ReportComponent,
  SettingComponent,
  PaymentComponent,
  ShippingComponent,
  StockComponent,
  AccountComponent,
  ProductComponent,
  CustomerDetailComponent,
  CustomerSharelinkComponent,
  CustomerAttachmentComponent,
  CustomerManageComponent,
  CustomerNewComponent,
  CustomerCompleteComponent,
  CustomerInprogressComponent,
  QuotationDetailComponent,
  QuotationManageComponent,
  OrderViewComponent,
  CustomerViewtaskComponent,
  PurchaseNewComponent,
  PurchaseDetailComponent,
  PurchaseManageComponent,
  SellerComponent,
} from "./components/dashboard";
import {
  VerificationComponent,
  LoginComponent,
  ForgotPasswordComponent,
  ForgetPasswordCompleteComponent,
  ResetPasswordComponent,
} from "./components/verification";
import { CanDeactivateGuard } from "./_guards";
import { MyDragDropDirective, ScrollDirective } from "./_directives";
import {
  JwtInterceptor,
  ErrorInterceptor,
  SafePipe,
  TimeoutInterceptor,
  DEFAULT_TIMEOUT,
} from "./_helpers";

import { PaginationComponent } from "./shared";

// import {
//   DateAdapter,
//   MAT_DATE_FORMATS,
//   MAT_DATE_LOCALE,
// } from "saturn-datepicker";
// import { MomentDateAdapter } from "@angular/material-moment-adapter";

// export const my_formats = {
//   parse: {
//     dateinput: "DD/MM/YYYY",
//   },
//   display: {
//     dateinput: "DD/MM/YYYY",
//     monthyearlabel: "mmm yyyy",
//     datea11ylabel: "ll",
//     monthyeara11ylabel: "mmmm yyyy",
//   },
// };

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    VerificationComponent,
    LoginComponent,
    ForgotPasswordComponent,
    ForgetPasswordCompleteComponent,
    ResetPasswordComponent,
    MyDragDropDirective,
    ScrollDirective,
    SafePipe,
    PaginationComponent,

    CustomerComponent,
    QuotationComponent,
    OrderComponent,
    PurchaseComponent,
    ReportComponent,
    SettingComponent,
    PaymentComponent,
    ShippingComponent,
    StockComponent,
    AccountComponent,
    ProductComponent,
    QuotationDetailComponent,
    QuotationManageComponent,
    CustomerDetailComponent,
    CustomerSharelinkComponent,
    CustomerAttachmentComponent,
    CustomerManageComponent,
    OrderViewComponent,
    CustomerNewComponent,
    CustomerCompleteComponent,
    CustomerInprogressComponent,
    CustomerViewtaskComponent,
    PurchaseNewComponent,
    PurchaseDetailComponent,
    PurchaseManageComponent,
    SellerComponent,
    AccountingComponent,
    WarehouseComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AppMaterialModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    ReactiveFormsModule,
    FormsModule,
    QuillModule.forRoot(),
    FlexLayoutModule.withConfig({ disableDefaultBps: true }),
    ModalModule.forRoot(),
    ColorPickerModule,
    InfiniteScrollModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgxPrintModule,
    NgbModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    NgxPaginationModule,
    NgSelect2Module,
    GoogleChartsModule,
  ],
  entryComponents: [],

  providers: [
    CanDeactivateGuard,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    [{ provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true }],
    [{ provide: DEFAULT_TIMEOUT, useValue: 1800000 }],
    // {
    //   provide: DateAdapter,
    //   useClass: MomentDateAdapter,
    //   deps: [MAT_DATE_LOCALE],
    // },
    // { provide: MAT_DATE_FORMATS, useValue: my_formats },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
