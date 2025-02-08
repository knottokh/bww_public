import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import {
  DashboardComponent,
  CustomerComponent,
  QuotationComponent,
  QuotationDetailComponent,
  QuotationManageComponent,
  OrderComponent,
  PurchaseComponent,
  PurchaseDetailComponent,
  PurchaseNewComponent,
  PurchaseManageComponent,
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
  OrderViewComponent,
  CustomerInprogressComponent,
  CustomerViewtaskComponent,
  SellerComponent,
} from "./components/dashboard";

import {
  VerificationComponent,
  LoginComponent,
  ForgotPasswordComponent,
  ForgetPasswordCompleteComponent,
  ResetPasswordComponent,
} from "./components/verification";

import { AuthGuard, CanDeactivateGuard } from "./_guards";
import { RouterPath } from "./_models";

const routes: Routes = [
  {
    path: RouterPath.login,
    component: VerificationComponent,
    children: [{ path: "", component: LoginComponent }],
  },
  {
    path: RouterPath.register,
    component: CustomerNewComponent,
    children: [],
  },
  {
    path: `${RouterPath.customertask}/:withId`,
    component: CustomerInprogressComponent,
    children: [],
  },
  {
    path: `${RouterPath.customertaskdetail}/:withId`,
    component: CustomerViewtaskComponent,
    children: [],
  },
  {
    path: RouterPath.registercomplete,
    component: CustomerCompleteComponent,
    children: [],
  },
  {
    path: RouterPath.forgetpassword,
    component: VerificationComponent,
    children: [{ path: "", component: ForgotPasswordComponent }],
  },
  {
    path: RouterPath.forgetcomplete,
    component: VerificationComponent,
    children: [{ path: "", component: ForgetPasswordCompleteComponent }],
  },
  {
    path: RouterPath.resetpassword,
    component: VerificationComponent,
    children: [{ path: "", component: ResetPasswordComponent }],
  },
  {
    path: RouterPath.root,
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "", redirectTo: "/" + RouterPath.customer, pathMatch: "full" },
    ],
  },
  //{ path: RouterPath.webmanagement, redirectTo: '/' + RouterPath.tips, pathMatch: 'full' },
  // {
  //   path: RouterPath.tips, component: DashboardComponent, canActivate: [AuthGuard],
  //   children: [
  //     {
  //       path: '', component: WebManagementComponent,
  //       children: [
  //         { path: '', component: TipsComponent },
  //         { path: 'new', component: ManageTipsComponent },
  //         { path: ':withId', component: ManageTipsComponent, canDeactivate: [CanDeactivateGuard] },
  //       ]
  //     },
  //   ]
  // },
  {
    path: RouterPath.customer,
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        component: CustomerComponent,
        children: [],
      },
      {
        path: "new",
        component: CustomerManageComponent,
        children: [],
      },
      {
        path: ":withId",
        component: CustomerManageComponent,
        children: [],
      },
      {
        path: ":withId/view",
        component: CustomerDetailComponent,
        children: [],
      },
      {
        path: "share/link",
        component: CustomerSharelinkComponent,
        children: [],
      },
      {
        path: ":withId/attachment",
        component: CustomerAttachmentComponent,
        children: [],
      },
    ],
  },
  {
    path: RouterPath.quotation,
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        component: QuotationComponent,
        children: [],
      },
      {
        path: ":withId/view",
        component: QuotationDetailComponent,
        children: [],
      },
      {
        path: ":withCustomerId/:withId",
        component: QuotationManageComponent,
        children: [],
      },
      {
        path: ":withCustomerId/new",
        component: QuotationManageComponent,
        children: [],
      },
    ],
  },
  {
    path: RouterPath.order,
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        component: OrderComponent,
        children: [],
      },
      {
        path: ":withCustomerId/:withId",
        component: OrderViewComponent,
        children: [],
      },
    ],
  },
  {
    path: RouterPath.purchase,
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        component: PurchaseComponent,
        children: [],
      },
      {
        path: ":withId/view",
        component: PurchaseDetailComponent,
        children: [],
      },
      {
        path: ":withCustomerId/:withId",//seller
        component: PurchaseManageComponent,
        children: [],
      },
      {
        // path: ":withCustomerId/new",
        path: "new",
        component: PurchaseNewComponent,
        children: [],
      },
    ],
  },
  {
    path: RouterPath.accounting,
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        component: AccountingComponent,
        children: [],
      },
    ],
  },
  {
    path: RouterPath.warehouse,
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        component: WarehouseComponent,
        children: [],
      },
    ],
  },
  {
    path: RouterPath.report,
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        component: ReportComponent,
        children: [],
      },
    ],
  },
  {
    path: RouterPath.setting,
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "", component: SettingComponent },
      { path: RouterPath.payment, component: PaymentComponent },
      { path: RouterPath.shipping, component: ShippingComponent },
      { path: RouterPath.stock, component: StockComponent },
      { path: RouterPath.product, component: ProductComponent },
      { path: RouterPath.account, component: AccountComponent },
      { path: RouterPath.seller, component: SellerComponent },
    ],
  },
  { path: "**", redirectTo: RouterPath.root, pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
