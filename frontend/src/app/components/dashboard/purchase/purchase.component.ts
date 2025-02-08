import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
} from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { RouterPath, User, QStatus } from "src/app/_models";
import {
  AuthenticationService,
  QuotationService,
  SellerService,
} from "src/app/_services";
import * as moment from "moment-timezone";
import { POStatus } from "src/app/_models/postatus";
import { Router } from "@angular/router";

@Component({
  selector: "app-purchase",
  templateUrl: "./purchase.component.html",
  styleUrls: ["./purchase.component.scss"],
})
export class PurchaseComponent implements OnInit {
  routepath: any;
  modalRef: BsModalRef;
  displayedColumns = ["quotation_code", "seller_name", "status", "created"];
  dataSource: any = [];

  qstatus: any = QStatus;

  currentUser: User;

  searchtype = "";
  searchtext = "";

  sorting = { modified: -1 };
  startRow = 0;
  pageSize = 20;
  dataSourceCount = 0;
  dataSourceLoading = false;
  currentPage = 1;

  postatus: any = POStatus;

  sellerDataSource: any = [];
  sellerSelected: any;

  init = true;

  ua = navigator.userAgent;

  loading = false;
  error = "";
  msgok = "";

  progress: any;
  messages: any;

  dlgloading = false;
  dlgerror = "";
  dlgmsgok = "";

  deleteResult = false;
  deleteElement: any = null;

  constructor(
    private authenticationService: AuthenticationService,
    private quotationService: QuotationService,
    private sellerService: SellerService,
    private modalService: BsModalService,
    public router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );
    this.routepath = RouterPath;
  }

  ngOnInit(): void {
    this.searchtype = "quotation_code";
    this.onSearchClick();
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
        this.ua
      )
    ) {
      this.displayedColumns = [
        "quotation_code",
        "seller_dealer",
        "status",
        "created",
      ];
    }
    this.fetchSellerData();
  }

  onPageChange(event) {
    this.currentPage = event;
    this.startRow = (this.currentPage - 1) * this.pageSize;
    this.onSearchClickEvent();
  }

  onSearchClick(ispush = false) {
    this.currentPage = 1;
    this.startRow = 0;
    this.onSearchClickEvent(ispush);
  }

  onSearchClickEvent(ispush = false, init?) {
    const searcharr = [];

    searcharr.push({ $eq: ["$document_type", "po"] });
    if (this.searchtext) {
      searcharr.push({
        $regexMatch: {
          input: { $toLower: `$${this.searchtype}` },
          regex: `.*${this.searchtext.toLowerCase()}.*`,
        },
      });
    }

    this.init = init || this.init;

    if (this.init) {
      searcharr.push({ $ne: ["$status", this.postatus.close] });
      searcharr.push({ $ne: ["$status", this.postatus.cancel] });
    }

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
    this.fetchData(search);
  }

  fetchData(search) {
    this.dataSourceLoading = true;
    this.quotationService.findBy(search).subscribe((d: any) => {
      this.dataSourceCount = d.count;

      this.dataSource = d.results.map((d) => {
        const created = d.created;
        d.created = moment(created).format("DD/MM/YYYY");
        d.product_code = d.stocks.map((s) => s.stock_code).join();
        return d;
      });
      this.changeDetectorRef.detectChanges();
    });
  }

  fetchSellerData() {
    let search = {
      sort: { sequence: 1 },
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

  resetClick() {
    this.searchtype = "quotation_code";
    this.searchtext = "";
    this.onSearchClick((this.init = true));
  }

  onSubmit() {
    let newQuotation = {
      _id: "0",
      quotation_code: "0",
      total_quantity: 0,
      total_price: 0,
      status: this.postatus.pending,
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
      stocks: [],
      ref_quotation_ids: [],
    };
    // console.log("new quotation", newQuotation);
    // console.log("sellerselected", this.sellerSelected);
    this.quotationService.add(newQuotation).subscribe(
      (data: any) => {
        // console.log("data result", data);
        this.msgok = data.message;
        this.loading = false;
        this.router.navigate([
          `/${this.routepath.purchase}/${data.result.seller_id}/${data.result._id}`,
        ]);
        this.decline();
      },
      (error: any) => {
        this.error = error.message;
        this.loading = false;
        console.log("Error: ", error);
        setTimeout(() => {
          this.error = "";
          this.changeDetectorRef.detectChanges();
        }, 5000);
        this.decline();
      }
    );
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
