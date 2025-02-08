import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
} from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { RouterPath, User } from "src/app/_models";
import {
  AuthenticationService,
  PaymentService,
  SellerService,
} from "src/app/_services";

@Component({
  selector: "app-seller",
  templateUrl: "./seller.component.html",
  styleUrls: ["../setting.component.scss", "./seller.component.scss"],
})
export class SellerComponent implements OnInit {
  routepath: any;

  modalRef: BsModalRef;

  displayedColumns = [
    "order",
    "seller_name",
    "phone",
    "payment_type",
    "seller_type",
    "action",
  ];
  dataSource: any = [];

  dataForm: FormGroup;
  currentUser: User;

  dlgloading = false;
  dlgerror = "";
  dlgmsgok = "";

  groupfilter = "";
  groups: string[] = [];

  deleteElement: any = null;
  deleteResult = false;

  payment_type_datas: any = [];
  payment_type_default: string = "";

  sorting = { sequence: 1 };
  startRow = 0;
  pageSize = 100;
  dataSourceCount = 0;
  dataSourceLoading = false;
  currentPage = 1;

  constructor(
    private authenticationService: AuthenticationService,
    private modalService: BsModalService,
    private sellerService: SellerService,
    private paymentService: PaymentService,
    private changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );
    this.dataForm = this.fb.group({
      _id: [""],
      seller_name: ["", Validators.required],
      dealer: [""],
      phone: ["", Validators.required],
      email: [""],
      line: [""],
      seller_type: ["VAT", Validators.required],
      payment_type: ["", Validators.required],
      payment_remark: [""],
    });
    this.routepath = RouterPath;
  }

  ngOnInit(): void {
    this.fetchPaymentData();
    this.onSearchClick();
  }

  onPageChange(event) {
    // console.log(event);
    this.currentPage = event;
    this.startRow = (this.currentPage - 1) * this.pageSize;
    this.onSearchClick();
  }

  onSearchClick(ispush = false) {
    const searcharr = [];
    let serach = {
      sort: this.sorting,
      startRow: this.startRow,
      endRow: this.pageSize,
    };
    if (searcharr.length > 0) {
      serach["filter"] = { $and: searcharr };
    } else {
      serach["filter"] = {};
    }
    this.fetchData(serach);
  }

  fetchData(search) {
    this.dataSourceLoading = true;
    this.sellerService.findBy(search).subscribe((d: any) => {
      this.dataSourceCount = d.count;
      this.dataSource = d.results;
      this.changeDetectorRef.detectChanges();
    });
  }

  fetchPaymentData() {
    this.paymentService
      .findBy({
        sort: { sequence: 1 },
        filter: {},
      })
      .subscribe((d: any) => {
        //console.log(data);
        this.payment_type_datas = d.results;
        if (this.payment_type_datas.length > 0 && !this.f.payment_type.value) {
          this.f.payment_type.setValue(this.payment_type_datas[0].title);
        }
        if (this.payment_type_datas.length > 0) {
          this.payment_type_default = this.payment_type_datas[0].title;
        }
        // this.f.payment_type.setValue(data.payment_type);
        this.changeDetectorRef.detectChanges();
      });
  }

  get f() {
    return this.dataForm.controls;
  }

  onSaveData() {
    this.dlgloading = true;
    this.dlgerror = "";

    let shareData: any = {
      seller_name: this.f.seller_name.value,
      dealer: this.f.dealer.value,
      phone: this.f.phone.value,
      email: this.f.email.value,
      line: this.f.line.value,
      seller_type: this.f.seller_type.value,
      payment_type: this.f.payment_type.value,
      payment_remark: this.f.payment_remark.value,
    };

    let service = this.sellerService.add(
      Object.assign(shareData, {
        createdby: this.currentUser.fullname,
      })
    );
    let isnew = true;
    if (this.f._id.value && this.f._id.value !== "") {
      isnew = false;
      service = this.sellerService.update(
        this.f._id.value,
        Object.assign(shareData, {
          modifiedby: this.currentUser.fullname,
        })
      );
    }

    service.subscribe(
      (data: any) => {
        this.decline();
        this.onSearchClick();
      },
      (error: any) => {
        this.dlgerror = error.message;
        this.dlgloading = false;
        this.changeDetectorRef.detectChanges();
        setTimeout(() => {
          this.dlgerror = "";
          this.changeDetectorRef.detectChanges();
        }, 5000);
      }
    );
  }

  swapIndex(a, m, n) {
    console.log(a, m, n);
    [a[m], a[n]] = [a[n], a[m]];
    //this.changeDetectorRef.detectChanges();
    this.sellerService.update_sequence(a).subscribe(
      (data: any) => {
        this.onSearchClick();
      },
      (error: any) => {
        this.dlgerror = error.message;
        this.dlgloading = false;
        this.changeDetectorRef.detectChanges();
        setTimeout(() => {
          this.dlgerror = "";
          this.changeDetectorRef.detectChanges();
        }, 5000);
      }
    );
  }

  onEdit(template: TemplateRef<any>, element: any) {
    this.f._id.setValue(element._id);
    this.f.seller_name.setValue(element.seller_name);
    this.f.dealer.setValue(element.dealer);
    this.f.phone.setValue(element.phone);
    this.f.email.setValue(element.email);
    this.f.line.setValue(element.line);
    this.f.seller_type.setValue(element.seller_type);
    this.f.payment_type.setValue(element.payment_type);
    this.f.payment_remark.setValue(element.payment_remark);
    this.openModal(template);
  }

  onDelete() {
    this.dlgloading = true;
    this.deleteResult = true;
    this.dlgerror = "";
    this.sellerService.delete(this.deleteElement._id).subscribe(
      (data: any) => {
        this.onSearchClick();
        this.decline();
      },
      (error: any) => {
        this.dlgerror = error.message;
        this.dlgloading = false;
        this.changeDetectorRef.detectChanges();
      }
    );
  }

  doFilter() {
    const tableFilters = [];
    tableFilters.push({
      id: "group",
      value: this.groupfilter,
    });
    this.dataSource.filter = JSON.stringify(tableFilters);
    if (this.dataSource.paginator) {
    }
  }

  openModal(template: TemplateRef<any>, element?: any) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-md modal-adj",
    });
    this.deleteResult = false;
    if (element) {
      this.deleteElement = element;
    }
  }
  decline(): void {
    this.dataForm = this.fb.group({
      _id: [""],
      seller_name: ["", Validators.required],
      dealer: [""],
      phone: ["", Validators.required],
      email: [""],
      line: [""],
      seller_type: ["VAT", Validators.required],
      payment_type: ["", Validators.required],
      payment_remark: [""],
    });
    this.dlgloading = false;
    this.modalRef.hide();
  }
}
