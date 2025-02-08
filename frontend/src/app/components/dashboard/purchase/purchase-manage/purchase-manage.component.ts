import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Role, RouterPath, Unit, UnitEng, User } from "src/app/_models";
import {
  AuthenticationService,
  SellerService,
  QuotationService,
  ShareService,
  StockService,
} from "src/app/_services";
import * as _moment from "moment-timezone";
import * as math from "mathjs";
import { QStatus, POStatus, QStockType } from "src/app/_models";

const moment = _moment;

@Component({
  selector: 'app-purchase-manage',
  templateUrl: './purchase-manage.component.html',
  styleUrls: ['./purchase-manage.component.scss']
})
export class PurchaseManageComponent implements OnInit {

  moment: any = moment;

  modalRef: BsModalRef;

  routepath: any;
  customerId: string;
  paramId: string;

  displayedColumns = ["title", "quantity", "unit", "price", "total_price"];
  dataSource: any = [];

  dataSourceQuotation: any;
  dataSourceDeleteStock: any = [];
  dataSourceDeleteProduct: any = [];

  stockDataSource: any = [];
  stockQuotationDataSource: any = [];
  searchStockList: any = [];

  postatus: any = POStatus;
  qStatus: any = QStatus;
  qStockType: any = QStockType;

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

  // currentCustomerData: any = {};
  stockSource: any = [];

  units: any = [];

  is_cancelled: boolean = false;
  isfromquotation: boolean = false;
  constructor(
    private authenticationService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService,
    public route: ActivatedRoute,
    public router: Router,
    private sellerService: SellerService,
    private quotationService: QuotationService,
    private stockService: StockService,
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

  private _filter_stock_product(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.stockProductOptions.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  private _filter_unit(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.unitOptions.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  get isSuperAdmin() {
    return this.currentUser && this.currentUser.role === Role.SuperAdmin;
  }


  ngOnInit(): void {
    // this.fetchCustomerData();
    this.fetchStockData();
    this.fetchStockQuotaionData();
    this.fetchQuotationData();
    this.loadDropdown();
  }

  // fetchCustomerData() {
  //   if (this.customerId && this.customerId !== "") {
  //     //this.firstload = true;
  //     this.sellerService.getById(this.customerId).subscribe((data: any) => {
  //       // console.log(data);
  //       this.currentCustomerData = data;

  //       //this.firstload = false;
  //       this.changeDetectorRef.detectChanges();
  //     });
  //   }
  // }

  fetchStockData() {
    const searcharr = [];

    searcharr.push({ $eq: ["$stock_type", 'ทั่วไป'] });


    let search = {
    };
    if (searcharr.length > 0) {
      search["filter"] = { $and: searcharr };
    } else {
      search["filter"] = {};
    }

    this.dataSourceLoading = true;
    this.stockService.findBy(search).subscribe((d: any) => {
      this.stockDataSource = d.results;
      this.changeDetectorRef.detectChanges();
      // this.searchStock("");
    });
  }

  fetchStockQuotaionData() {
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
      this.stockQuotationDataSource = d.results;
      this.changeDetectorRef.detectChanges();
      //this.searchStock("");
    });
  }

  fetchQuotationData() {
    if (this.paramId && this.paramId !== "" && this.paramId !== "new") {
      this.dataSourceLoading = true;
      this.quotationService.getById(this.paramId).subscribe((data: any) => {
        // console.log("quotation data", data);
        this.dataSourceCount = data.count;
        this.dataSourceQuotation = data;
        let currentStocks = data.stocks.map((stock) => {
          let findProduct = data.products.filter(
            (p) => stock._id === p.quotation_stock_id
          );
          stock.products = [];
          if (findProduct !== undefined) {
            findProduct.map((f) => {
              stock.products.push(f);
            });
          }

          return stock;
        });
        this.dataSource = currentStocks;
        delete this.dataSourceQuotation["stocks"];
        delete this.dataSourceQuotation["products"];
        // console.log("Datasoure quotation:", this.dataSourceQuotation);
        this.changeDetectorRef.detectChanges();
      });
    }
    //console.log("datasourcequotation:", this.dataSourceQuotation);
  }

  loadDropdown() {
    this.stockService.getUnits().subscribe((d: any) => {
      this.unitOptions = d;
      // this.filterunitOptions = this.dataForm.controls.unit.valueChanges.pipe(
      //   startWith(""),
      //   map((value) => this._filter_unit(value))
      // );
      this.changeDetectorRef.detectChanges();
    });
  }

  swapIndex(a, m, n) {
    [a[m], a[n]] = [a[n], a[m]];
  }

  filterProduct(stock_id) {
    return (this.dataSource.products || []).filter(
      (f) => f._id.toString() == stock_id.toString()
    );
  }

  onSearchChange(searchValue: string): void {
    this.searchStock(searchValue);
  }

  searchStock(searchValue: string) {
    //console.log("this.isfromquotation", this.isfromquotation)
    if (!this.isfromquotation) {
      if (this.searchtype == "stock_code") {
        this.searchStockList = this.stockDataSource.filter((stock) =>
          stock.stock_code.includes(searchValue)
        );
      } else {
        this.searchStockList = this.stockDataSource.filter((stock) =>
          stock.title.includes(searchValue)
        );
      }
    } else {
      if (this.searchtype == "stock_code") {
        this.searchStockList = this.stockQuotationDataSource.filter((stock) =>
          stock.stock_code.includes(searchValue)
        );
      } else {
        this.searchStockList = this.stockQuotationDataSource.filter((stock) =>
          stock.title.includes(searchValue)
        );
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  onStockSelect(selectedStock) {
    this.dataSource.push({
      _id: "0",
      temp_quotation_id: selectedStock.quotation_id || '0',
      quotation_code: selectedStock.quotation_code || '',
      temp_id: selectedStock._id || '0',
      title: selectedStock.title,
      original_title: selectedStock.title,
      sequence: 0,
      quantity: selectedStock.quantity || 1,
      unit: selectedStock.unit,
      price: selectedStock.price,
      product_code: "",
      product_unit: "",
      product_weight: 0,
      stock_code: selectedStock.stock_code,
      stock_type: selectedStock.stock_type,
      status: "สั่งซื้อ",
      from_quotation: this.isfromquotation,
      products: [],
      created: Date.now(),
      modified: Date.now(),
      createdby: this.currentUser.username,
      modifiedby: this.currentUser.username,
    });
    // this.dataSource[this.selectedStockIndex].title = selectedStock.title;
    // this.dataSource[this.selectedStockIndex].original_title =
    //   selectedStock.title;
    // this.dataSource[this.selectedStockIndex].quantity = 1;
    // this.dataSource[this.selectedStockIndex].unit = selectedStock.unit;
    // this.dataSource[this.selectedStockIndex].price = selectedStock.price;

    // this.dataSource[this.selectedStockIndex].stock_code =
    //   selectedStock.stock_code;
    // this.dataSource[this.selectedStockIndex].stock_type =
    //   selectedStock.stock_type;

    // if (
    //   selectedStock.stock_type === this.qStockType.order ||
    //   selectedStock.stock_type === this.qStockType.order1D
    // ) {
    //   // case สั่งผลิด, สั่งผลิต 1D
    //   // add product to array
    //   this.dataSource[this.selectedStockIndex].product_code =
    //     selectedStock.product_code;
    //   this.dataSource[this.selectedStockIndex].product_unit =
    //     selectedStock.product_unit;
    //   this.dataSource[this.selectedStockIndex].product_weight =
    //     selectedStock.product_weight;
    // } else {
    //   // case ทั่วไป
    // }

    this.decline();
  }

  // addStock() {
  //   this.dataSource.push({
  //     _id: "0",
  //     title: "",
  //     original_title: "",
  //     sequence: 0,
  //     quantity: 0,
  //     unit: "",
  //     price: 0,
  //     product_code: "",
  //     product_unit: "",
  //     product_weight: 0,
  //     stock_code: "",
  //     stock_type: "",
  //     products: [],
  //     created: Date.now(),
  //     modified: Date.now(),
  //     createdby: this.currentUser.username,
  //     modifiedby: this.currentUser.username,
  //   });
  // }

  removeStock(index: number, quotationDetail) {
    this.dataSource.splice(index, 1);
    if (quotationDetail._id !== "0") {
      this.dataSourceDeleteStock.push(quotationDetail);
    }
  }

  removeProduct(quotationIndex, productIndex, product) {
    this.dataSource[quotationIndex].products.splice(productIndex, 1);
    if (product._id !== "0") {
      this.dataSourceDeleteProduct.push(product);
    }
  }

  addProduct(quotationDetail) {
    // quotation_product
    quotationDetail.products.push({
      _id: "0",
      sequence: 0,
      product_code: quotationDetail.product_code,
      product_unit: quotationDetail.product_unit,
      product_weight: quotationDetail.product_weight,
      width: 0,
      height: 0,
      quantity: 1,
      unit: quotationDetail.unit ? quotationDetail.unit : "แผง",
      price: 0,
      created: Date.now(),
      modified: Date.now(),
      createdby: this.currentUser.username,
      modifiedby: this.currentUser.username,
    });
  }

  calculate(quotationDetail) {
    quotationDetail.products.map((product) => {
      let width = 0;
      let height = 0;
      if (product.width) {
        const convertWidth = math.unit(
          product.width,
          UnitEng[quotationDetail.product_unit]
        );
        width = parseFloat(convertWidth.toNumber(UnitEng["เมตร"]).toFixed(3));
      }
      if (product.height) {
        const convertHeight = math.unit(
          product.height,
          UnitEng[quotationDetail.product_unit]
        );
        height = parseFloat(convertHeight.toNumber(UnitEng["เมตร"]).toFixed(3));
      }
      product.price = Math.ceil(width * height * quotationDetail.price).toFixed(
        2
      );
    });
  }

  // onStockProductChange(event, index) {
  //   const selectedProduct = this.stockDataSource.filter(
  //     (x) => x.title == event.value
  //   );

  //   if (selectedProduct.length > 0) {
  //     this.dataSource[index].title = selectedProduct[0].title;
  //     this.dataSource[index].original_title = selectedProduct[0].title;
  //     this.dataSource[index].quantity = 1;
  //     this.dataSource[index].unit = selectedProduct[0].unit;
  //     this.dataSource[index].price = selectedProduct[0].price;

  //     this.dataSource[index].stock_code = selectedProduct[0].stock_code;
  //     this.dataSource[index].stock_type = selectedProduct[0].stock_type;

  //     if (
  //       selectedProduct[0].stock_type === this.qStockType.order ||
  //       selectedProduct[0].stock_type === this.qStockType.order1D
  //     ) {
  //       // case สั่งผลิด, สั่งผลิต 1D
  //       // add product to array
  //       this.dataSource[index].product_code = selectedProduct[0].product_code;
  //       this.dataSource[index].product_unit = selectedProduct[0].product_unit;
  //       this.dataSource[index].product_weight =
  //         selectedProduct[0].product_weight;
  //     } else {
  //       // case ทั่วไป
  //     }
  //   }
  // }

  unitChange(event, i) {
    if (this.dataSource[i].products.length > 0) {
      this.dataSource[i].products.forEach((f) => {
        if (f.width) {
          const oldw = math.unit(
            f.width,
            UnitEng[this.dataSource[i].product_unit]
          );
          f.width = parseFloat(oldw.toNumber(UnitEng[event.value]).toFixed(3));
        }
        if (f.height) {
          const oldh = math.unit(
            f.height,
            UnitEng[this.dataSource[i].product_unit]
          );
          f.height = parseFloat(oldh.toNumber(UnitEng[event.value]).toFixed(3));
        }
      });
    }

    this.dataSource[i].product_unit = event.value;
  }

  onSubmit() {
    this.loading = true;
    let service;
    let isnew = true;

    let total_quantity = 0;
    let total_price = 0;

    // loop stock to add sequence, quantity, total_amount
    for (let i = 0; i < this.dataSource.length; i++) {
      this.dataSource[i].sequence = i + 1;
      total_quantity += this.dataSource[i].quantity;
      total_price += +this.dataSource[i].price * +this.dataSource[i].quantity;
      if (this.dataSource[i].products.length > 0) {
        total_quantity -= +this.dataSource[i].quantity;
        total_price -= +this.dataSource[i].price * +this.dataSource[i].quantity;
        for (let j = 0; j < this.dataSource[i].products.length; j++) {
          this.dataSource[i].products[j].sequence = j + 1;
          total_quantity += +this.dataSource[i].products[j].quantity;
          total_price +=
            +this.dataSource[i].products[j].price *
            +this.dataSource[i].products[j].quantity;
        }
      }
    }

    //check role admin approved

    let skipToApproved = (this.dataSourceQuotation.status != this.postatus.approved && this.isSuperAdmin && this.dataSource.length > 0);

    // 1 create quotation.
    // 2 quotation stock
    // 3 quotation product
    if (this.paramId === "new") {
      // create quotaiton.
      // should generate quotation_code from Q + yy + mm + running number 3 digit.
      let newQuotation = {
        _id: "0",
        quotation_code: "0",
        // customer_code: this.currentCustomerData.customer_code,
        // customer_name: this.currentCustomerData.customer_name,
        // dealer: this.currentCustomerData.dealer,
        // phone: this.currentCustomerData.phone,
        // email: this.currentCustomerData.email,
        // line: this.currentCustomerData.line,
        // customer_type: this.currentCustomerData.customer_type,
        // payment_type: this.currentCustomerData.payment_type,
        // payment_remark: this.currentCustomerData.payment_remark,
        // shipping_type: this.currentCustomerData.shipping_type,
        // shipping_detail: this.currentCustomerData.shipping_detail,
        // tax_address: this.currentCustomerData.tax_address,
        // tax_id: this.currentCustomerData.tax_id,
        total_quantity: total_quantity,
        total_price: total_price,
        // note: this.currentCustomerData.note,
        // remark: this.currentCustomerData.remark,
        status: skipToApproved ? this.postatus.approved : this.postatus.pending,
        document_type: "po",
        // customer_id: this.currentCustomerData._id,
        created: Date.now(),
        modified: Date.now(),
        createdby: this.currentUser.fullname,
        created_role: this.currentUser.display_role,
        modifiedby: this.currentUser.username,
        modified_role: this.currentUser.display_role,
        stocks: this.dataSource,
      };
      if (skipToApproved) {
        newQuotation["approved"] = Date.now();
        newQuotation["approvedby"] = this.currentUser.fullname;
        newQuotation["approved_role"] = this.currentUser.display_role;
      }
      service = this.quotationService.add(newQuotation);
    } else {
      // update quotation.
      isnew = false;
      this.dataSourceQuotation.total_quantity = total_quantity;
      this.dataSourceQuotation.total_price = total_price;
      this.dataSourceQuotation.modified = Date.now();
      this.dataSourceQuotation.modifiedby = this.currentUser.username;
      this.dataSourceQuotation.modified_role = this.currentUser.display_role;

      if (skipToApproved) {
        this.dataSourceQuotation.status = this.postatus.approved;
        this.dataSourceQuotation["approved"] = Date.now();
        this.dataSourceQuotation["approvedby"] = this.currentUser.fullname;
        this.dataSourceQuotation["approved_role"] = this.currentUser.display_role;
      }

      let new_old_stocks = [];
      let onlynewstocks = this.dataSource.filter((f: any) => f._id == "0" && f.temp_quotation_id != "0");
      onlynewstocks.forEach((element) => {
        new_old_stocks.push({ ...element });
      });

      let refqids = onlynewstocks.map((m: any) => m.temp_quotation_id);
      this.dataSource.forEach((element) => {
        delete element.temp_quotation_id;
        delete element.temp_id;
      });

      new_old_stocks.forEach((element) => {
        element._id = element.temp_id;
        delete element.temp_quotation_id;
        delete element.temp_id;
      });


      // console.log("refqids", refqids);
      // console.log( this.dataSource);
      // console.log("new_old_stocks", new_old_stocks);
      this.dataSourceQuotation.ref_quotation_ids = (this.dataSourceQuotation.ref_quotation_ids || []).concat(refqids);
      //console.log(this.dataSourceQuotation);
      service = this.quotationService.update(this.paramId, {
        quotation: this.dataSourceQuotation,
        stocks: this.dataSource,
        old_stocks: new_old_stocks,
        deleteStocks: this.dataSourceDeleteStock,
        deleteProducts: this.dataSourceDeleteProduct,
      });
    }

    service.subscribe(
      (data: any) => {
        // console.log("data after submit", data);
        this.msgok = data.message;
        this.loading = false;
        if (!isnew) {
          this.router.navigate([
            `/${this.routepath.purchase}/${this.paramId}/view`,
          ]);
        } else {
          this.router.navigate([
            `/${this.routepath.purchase}/${data.result._id}/view`,
          ]);
        }
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

  openModal(template: TemplateRef<any>, element?: any) {
    if (this.modalRef !== undefined) this.modalRef.hide();
    this.modalRef = this.modalService.show(template, {
      class: "modal-smart-search",
    });
    document.getElementById('itemselect').focus();
    this.deleteResult = false;
  }

  openModalAdd(template: TemplateRef<any>, isfromquotation: boolean) {
    this.isfromquotation = isfromquotation;
    this.searchStock("");
    if (this.modalRef !== undefined) this.modalRef.hide();
    this.modalRef = this.modalService.show(template, {
      class: "modal-smart-search",
    });
    document.getElementById('itemselect').focus();
    this.deleteResult = false;
  }

  decline(): void {
    this.dlgloading = false;
    this.modalRef.hide();
  }

  onBackto() {
    // if (this.paramId === "new") {
    //   this.router.navigate([
    //     `/${this.routepath.customer}/${this.currentCustomerData._id}/view`,
    //   ]);
    // } else {
    //   this.router.navigate([
    //     `/${this.routepath.purchase}/${this.dataSourceQuotation._id}/view`,
    //   ]);
    // }
    // this.router.navigate([`/${this.routepath.registercomplete}`]);
    this.router.navigate([
      `/${this.routepath.purchase}/${this.dataSourceQuotation._id}/view`,
    ]);
  }

}
