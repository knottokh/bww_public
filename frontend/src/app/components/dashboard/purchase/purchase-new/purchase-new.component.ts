import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import {
  RouterPath,
  Unit,
  UnitEng,
  User,
  QStatus,
  QStockType,
  QStockStatus,
  POStatus,
  Role,
} from "src/app/_models";
import {
  AuthenticationService,
  CustomerService,
  QuotationService,
  SellerService,
  ShareService,
  StockService,
} from "src/app/_services";
import * as _moment from "moment-timezone";
import * as math from "mathjs";

const moment = _moment;

@Component({
  selector: "app-purchase-new",
  templateUrl: "./purchase-new.component.html",
  styleUrls: ["./purchase-new.component.scss"],
})
export class PurchaseNewComponent implements OnInit {
  moment: any = moment;

  modalRef: BsModalRef;

  routepath: any;
  customerId: string;
  paramId: string;

  deleteElement: any = null;
  displayedColumns = ["title", "quantity", "unit", "price", "total_price"];
  dataSource: any = [];

  dataSourceDeleteStock: any = [];
  dataSourceDeleteProduct: any = [];

  stockDataSource: any = [];
  searchStockList: any = [];

  deleteStockSelected: any;

  sellerDataSource: any = [];
  sellerSelected: any;

  qStatus: any = QStatus;
  qStockType: any = QStockType;
  qStockStatus: any = QStockStatus;

  postatus: any = POStatus;

  selectedProduct: any = [];
  selectedStockIndex: any;

  dataForm: FormGroup;
  currentUser: User;

  loading = false;
  error = "";
  msgok = "";

  progress: any;
  messages: any;

  dlgloading = false;
  dlgerror = "";
  dlgmsgok = "";

  deleteResult = false;

  documenttype = "";
  searchtype = "stock_code";
  searchtext = "";

  sorting = { sequence: 1 };
  startRow = 0;
  pageSize = 20;
  dataSourceCount = 0;
  dataSourceLoading = false;
  currentPage = 1;

  stockProductOptions: any = [];
  filterStockProductOptions: any = [];

  unitOptions: any = [];
  filterunitOptions: any = [];

  currentCustomerData: any = {};
  stockSource: any = [];

  units: any = [];

  is_cancelled: boolean = false;

  is_select_all: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService,
    public route: ActivatedRoute,
    public router: Router,
    private customerService: CustomerService,
    private quotationService: QuotationService,
    private stockService: StockService,
    private sellerService: SellerService,
    private shareService: ShareService
  ) {
    this.authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );
    this.routepath = RouterPath;
    this.route.params.subscribe((params: Params) => {
      this.customerId = params.withCustomerId;
      this.paramId = params.withId;
    });
    this.units = Object.keys(Unit).map((m) => Unit[m]);
  }

  ngOnInit(): void {
    this.fetchCustomerData();
    this.fetchSellerData();
    // this.fetchStockData();
    this.fetchData();
    this.loadDropdown();
  }

  get isSuperAdmin() {
    return this.currentUser && this.currentUser.role === Role.SuperAdmin;
  }

  fetchCustomerData() {
    if (this.customerId && this.customerId !== "") {
      this.customerService.getById(this.customerId).subscribe((data: any) => {
        this.currentCustomerData = data;
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  fetchSellerData() {
    let search = {
      sort: this.sorting,
      startRow: 0,
      endRow: 99999,
      filter: {},
    };
    this.sellerService.findBy(search).subscribe((d: any) => {
      // console.log("Seller result", d.results);
      this.sellerDataSource = d.results;
      this.changeDetectorRef.detectChanges();
    });
  }

  fetchStockData() {
    this.dataSourceLoading = true;
    this.stockService.findBy({ filter: {} }).subscribe((d: any) => {
      this.stockDataSource = d.results;
      this.changeDetectorRef.detectChanges();
    });
  }

  fetchData() {
    const searcharr = [];

    searcharr.push({
      $eq: [{ $toString: "$stock_type" }, this.qStockType.normal],
    });
    searcharr.push({ $eq: [{ $toString: "$status" }, this.qStatus.ordered] });

    let search = {
      sort: this.sorting,
      startRow: this.startRow,
      endRow: this.pageSize,
    };
    if (searcharr.length > 0) {
      search["filter"] = { $and: searcharr };
    } else {
      search["filter"] = {};
    }
    this.quotationService.findDetailBy(search).subscribe((d: any) => {
      // console.log("result from api", d.results);
      let dataAddCheckbox = [];
      if (d.results.length > 0) {
        d.results
          .sort(
            (a, b) =>
              new Date(b.approved).getTime() - new Date(a.approved).getTime()
          )
          .map((data: any) => {
            let quotationDetail = { ...data, selected: false };
            dataAddCheckbox.push(quotationDetail);
          });
      }
      // console.log(dataAddCheckbox);
      this.dataSource = dataAddCheckbox;
      this.changeDetectorRef.detectChanges();
    });
    // if (this.paramId && this.paramId !== "" && this.paramId !== "new") {
    //   this.dataSourceLoading = true;
    //   this.quotationService.getById(this.paramId).subscribe((data: any) => {
    //     // console.log("quotation data", data);
    //     this.dataSourceCount = data.count;
    //     this.dataSourceQuotation = data;
    //     let currentStocks = data.stocks.map((stock) => {
    //       let findProduct = data.products.filter(
    //         (p) => stock._id === p.quotation_stock_id
    //       );
    //       stock.products = [];
    //       if (findProduct !== undefined) {
    //         findProduct.map((f) => {
    //           stock.products.push(f);
    //         });
    //       }

    //       return stock;
    //     });
    //     this.dataSource = currentStocks;
    //     delete this.dataSourceQuotation["stocks"];
    //     delete this.dataSourceQuotation["products"];
    //     this.changeDetectorRef.detectChanges();
    //   });
    // }
  }

  loadDropdown() {
    this.stockService.getUnits().subscribe((d: any) => {
      this.unitOptions = d;
      this.changeDetectorRef.detectChanges();
    });
  }

  selectAll() {
    this.dataSource.map((data) => {
      data.selected = this.is_select_all;
    });
    // this.changeDetectorRef.detectChanges();
  }

  onSubmit() {
    // this.loading = true;
    // let service;
    let isnew = true;

    let total_quantity = 0;
    let total_price = 0;

    let selectedList = this.dataSource.filter((data) => data.selected === true);
    // loop stock to add sequence, quantity, total_amount
    for (let i = 0; i < selectedList.length; i++) {
      selectedList[i].sequence = i + 1;
      selectedList[i].status = this.postatus.pending;
      selectedList[i].from_quotation = true;
      total_quantity += +selectedList[i].quantity;
      total_price += +selectedList[i].price * +selectedList[i].quantity;

      // ***Purchase should not have product
      // if (selectedList[i].products.length > 0) {
      //   total_quantity -= selectedList.quantity;
      //   total_price -= +selectedList.price * +selectedList.quantity;
      //   for (let j = 0; j < selectedList.products.length; j++) {
      //     selectedList.products[j].sequence = j + 1;
      //     total_quantity += +selectedList.products[j].quantity;
      //     total_price +=
      //       +selectedList.products[j].price *
      //       +selectedList.products[j].quantity;
      //   }
      // }
    }

    // console.log("select list", selectedList);
    let qids = selectedList.map((m: any) => m.quotation_id);
    let uniqueqids = new Set(qids);
    let refqids = [...uniqueqids];
    // console.log("Refqids", refqids);

    let skipToApproved = this.isSuperAdmin && selectedList.length > 0;

    let newQuotation = {
      _id: "0",
      quotation_code: "0",
      total_quantity: 0,
      total_price: 0,
      status: skipToApproved ? this.postatus.approved : this.postatus.pending,
      document_type: "po",
      seller_id: this.sellerSelected._id,
      seller_name: this.sellerSelected.seller_name,
      seller_dealer: this.sellerSelected.dealer,
      seller_phone: this.sellerSelected.phone,
      seller_email: this.sellerSelected.email,
      seller_line: this.sellerSelected.line,
      seller_type: this.sellerSelected.seller_type,
      seller_payment_type: this.sellerSelected.payment_type,
      seller_payment_remark: this.sellerSelected.payment_remark,
      created: Date.now(),
      modified: Date.now(),
      createdby: this.currentUser.fullname,
      modifiedby: this.currentUser.username,
      created_role: this.currentUser.display_role,
      modified_role: this.currentUser.display_role,
      stocks: selectedList,
      ref_quotation_ids: refqids,
    };

    if (skipToApproved) {
      newQuotation["approved"] = Date.now();
      newQuotation["approvedby"] = this.currentUser.fullname;
      newQuotation["approved_role"] = this.currentUser.display_role;
    }

    this.quotationService.add(newQuotation).subscribe(
      (data: any) => {
        // console.log("data after submit", data);
        this.msgok = data.message;
        this.loading = false;
        this.decline();
        this.router.navigate([
          `/${this.routepath.purchase}/${data.result._id}/view`,
        ]);
        // if (!isnew) {
        //   this.router.navigate([
        //     `/${this.routepath.quotation}/${this.paramId}/view`,
        //   ]);
        // } else {
        //   this.router.navigate([
        //     `/${this.routepath.quotation}/${data.result._id}/view`,
        //   ]);
        // }
      },
      (error: any) => {
        this.error = error.message;
        this.loading = false;
        console.log("Error: ", error);
        setTimeout(() => {
          this.error = "";
          this.changeDetectorRef.detectChanges();
        }, 5000);
      }
    );
  }

  removeQuotationDetail(index: number, quotationDetail) {
    this.dataSource.splice(index, 1);
    if (quotationDetail._id !== "0") {
      this.dataSourceDeleteStock.push(quotationDetail);
    }
  }

  setDeleteStockSelected(quotationDetail) {
    this.deleteStockSelected = quotationDetail;
  }

  onDeleteStockSelected() {
    let shareData: any = {
      ...this.deleteStockSelected,
      status: this.qStockStatus.delete,
    };
    delete shareData["approved"];
    delete shareData["approvedby"];
    // console.log("sharedata", shareData);

    let service = this.quotationService.updateQuotationStock(
      this.deleteStockSelected._id,
      Object.assign(shareData, {
        modified: Date.now(),
        modifiedby: this.currentUser.fullname,
      })
    );

    service.subscribe(
      (data: any) => {
        this.decline();
        this.fetchData();
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

  onBackto() {
    this.router.navigate([`/${this.routepath.purchase}`]);
  }

  openModal(template: TemplateRef<any>, element?: any) {
    if (this.modalRef !== undefined) this.modalRef.hide();
    this.modalRef = this.modalService.show(template, {
      class: "modal-md modal-adj",
    });
    this.deleteResult = false;
    if (element) {
      this.deleteElement = element;
    }
  }

  decline(): void {
    this.dlgloading = false;
    this.modalRef.hide();
  }
}
