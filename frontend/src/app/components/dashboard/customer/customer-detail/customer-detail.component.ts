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
import { RouterPath, User, Role } from "src/app/_models";
import {
  AuthenticationService,
  CustomerService,
  QuotationService,
  ShareService,
} from "src/app/_services";
import { ActivatedRoute, Params, Router } from "@angular/router";
import * as _moment from "moment-timezone";
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../../../environments/environment';
import { EncodeSpacialC } from "src/app/_helpers";
const moment = _moment;
@Component({
  selector: "app-customer-detail",
  templateUrl: "./customer-detail.component.html",
  styleUrls: ["../customer.component.scss", "./customer-detail.component.scss"],
})
export class CustomerDetailComponent implements OnInit {
  routepath: any;

  modalRef: BsModalRef;

  paramId: string;
  //modalRef2: BsModalRef;
  //@ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  //@ViewChild(MatSort) sort: MatSort;

  displayedColumns = [
    "quotation_code",
    "document_type",
    "created",
    "status",
    "product_code",
    // "remark",
  ];
  dataSource: any = [];

  currentUser: User;

  dlgloading = false;
  dlgerror = "";
  dlgmsgok = "";

  deleteResult = false;

  sorting = { modified: -1 };
  startRow = 0;
  pageSize = 20;
  dataSourceCount = 0;
  dataSourceLoading = false;
  currentPage = 1;

  currentData: any = {};

  documenttype = "";
  searchtext = "";

  clipboardurl = "";

  q_type:any =  {
    'q': 'ใบเสนอราคา',
    'j': 'ใบสั่งผลิต'
  }

  ua = navigator.userAgent;

  constructor(
    private authenticationService: AuthenticationService,
    private modalService: BsModalService,
    private customerService: CustomerService,
    private quotationService: QuotationService,
    private changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    public route: ActivatedRoute,
    public router: Router,
    private shareService: ShareService
  ) {
    this.authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );
    this.route.params.subscribe((params: Params) => {
      this.paramId = params.withId;
    });

    this.routepath = RouterPath;
  }
  ngOnInit(): void {
    this.onSearchClick();
    this.fetchData();
    this.fetchViewTask();

    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(this.ua))
    {
      this.displayedColumns = [
        "quotation_code",
        "created",
        "status"
      ];
    }
  }

  fetchData() {
    if (this.paramId && this.paramId !== "") {
      //this.firstload = true;
      this.customerService.getById(this.paramId).subscribe((data: any) => {
        //console.log(data);
        this.currentData = data;

        //this.firstload = false;
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  fetchViewTask() {
    //this.showLoading();
    this.customerService
      .getViewTask()
      .subscribe((data: any) => {
        //console.log(data);
        let enParamId = EncodeSpacialC(CryptoJS.AES.encrypt(this.paramId, environment.encPassword).toString());
        this.clipboardurl = `${data.url}/${enParamId}`;
        this.changeDetectorRef.detectChanges();
        //this.hideLoading();
      });

  }

  onPageChange(event) {
    console.log(event);
    this.currentPage = event;
    this.startRow = (this.currentPage - 1) * this.pageSize;
    this.onSearchClick();
  }

  resetClick() {
    this.documenttype = "";
    this.searchtext = "";
    this.onSearchClick();
  }
  onSearchClick(ispush = false) {
    const searcharr = [];

    searcharr.push({ $eq: [{ $toString: "$customer_id" }, this.paramId] });

    if (this.documenttype) {
      searcharr.push({ $eq: ["$document_type", this.documenttype] });
    }

    if (this.searchtext) {
      searcharr.push({
        $regexMatch: {
          input: { $toLower: `$quotation_code` },
          regex: `${this.searchtext.toLowerCase()}$`,
        },
      });
    }

    // if (this.searchtext !== '') {
    //   let ormatch = [];
    //   let fieldarr = ['fullname'];
    //   for (let i = 0; i < fieldarr.length; i++) {
    //     ormatch.push({ $regexMatch: { input: { $toLower: `$${fieldarr[i]}` }, regex: `.*${this.searchtext.toLowerCase()}.*` } })
    //   }
    //   searcharr.push(
    //     {
    //       $or: ormatch
    //     }
    //   );
    // }
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
    this.fetchQuotationData(serach);
  }

  fetchQuotationData(search) {
    this.dataSourceLoading = true;
    this.quotationService.findBy(search).subscribe((d: any) => {
      console.log("fetchQuotationData", d);
      this.dataSourceCount = d.count;

      this.dataSource = d.results.map((d) => {
        const cursenddate = moment(d.created).tz(this.shareService.tz);
        d.created = cursenddate.format("D/M/YYYY");
        d.product_code = d.stocks.map((s) => s.stock_code).join();
        return d;
      });
      //this.dataSource.paginator = this.paginator;
      //this.paginator.length = this.dataSource.data.length;
      //this.paginator.page.next();

      // this.dataSource.filterPredicate =
      //   (data: any, filtersJson: string) => {
      //     const matchFilter = [];
      //     const filters = JSON.parse(filtersJson);

      //     filters.forEach(filter => {
      //       const val = (typeof data[filter.id] === 'undefined' || data[filter.id] === null) ? '' : data[filter.id].toString().trim();
      //       //console.log(val);
      //       matchFilter.push(val.toLowerCase().includes(filter.value.trim().toLowerCase()));
      //     });
      //     return matchFilter.some(Boolean);
      //   };
      // this.doFilter();
      this.changeDetectorRef.detectChanges();
    });
  }

  onDelete() {
    this.dlgloading = true;
    this.deleteResult = true;
    this.dlgerror = "";
    this.customerService.delete(this.paramId).subscribe(
      (data: any) => {
        this.onSearchClick();
        this.decline();
        this.router.navigate([`/${this.routepath.customer}`]);
      },
      (error: any) => {
        this.dlgerror = error.message;
        this.dlgloading = false;
        this.changeDetectorRef.detectChanges();
      }
    );
  }

  openModal(template: TemplateRef<any>, element?: any) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-md modal-adj",
    });
    this.deleteResult = false;
  }
  decline(): void {
    this.dlgloading = false;
    this.modalRef.hide();
  }

  showLoading() {
    document.getElementById('showModalLoading')!.click();
  }
  hideLoading() {
    document.getElementById('hideModalLoading')!.click();
  }

  get isUser() {
    return this.currentUser && this.currentUser.role === Role.User;
  }
  get isAdmin() {
    return this.currentUser && this.currentUser.role === Role.Admin;
  }
  get isSuperAdmin() {
    return this.currentUser && this.currentUser.role === Role.SuperAdmin;
  }

}
