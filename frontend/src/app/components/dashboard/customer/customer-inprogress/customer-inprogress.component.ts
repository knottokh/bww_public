import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
} from "@angular/core";
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../../../environments/environment';
import { RouterPath, User } from "src/app/_models";
import {
  AuthenticationService,
  CustomerService,
  QuotationService,
  ShareService,
} from "src/app/_services";
import { ActivatedRoute, Params, Router } from "@angular/router";
import * as _moment from "moment-timezone";
import { DecodeSpacialC, EncodeSpacialC } from "src/app/_helpers";
import { JStatus } from "src/app/_models/jstatus";

const moment = _moment;

@Component({
  selector: 'app-customer-inprogress',
  templateUrl: './customer-inprogress.component.html',
  styleUrls: ['./customer-inprogress.component.scss']
})
export class CustomerInprogressComponent implements OnInit {
  //EncodeSpacialC(CryptoJS.AES.encrypt(this.f.email.value, environment.encPassword).toString());
  // CryptoJS.AES.decrypt(DecodeSpacialC(befordec), environment.encPassword).toString(CryptoJS.enc.Utf8);
  routepath: any;

  paramId: string;


  displayedColumns = [
    "quotation_code",
    // "document_type",
    // "created",

    "document_reference",
    "remark",
    "status",
  ];
  dataSource: any = [];

  q_type:any =  {
    'q': 'ใบเสนอราคา',
    'j': 'ใบสั่งผลิต'
  }
  //currentUser: User;

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

  jstatus: any = JStatus;

  constructor(
    private authenticationService: AuthenticationService,
    private customerService: CustomerService,
    private quotationService: QuotationService,
    private changeDetectorRef: ChangeDetectorRef,
    public route: ActivatedRoute,
    public router: Router,
    private shareService: ShareService
  ) {
    // this.authenticationService.currentUser.subscribe(
    //   (x) => (this.currentUser = x)
    // );
    this.route.params.subscribe((params: Params) => {
      this.paramId = CryptoJS.AES.decrypt(DecodeSpacialC(params.withId), environment.encPassword).toString(CryptoJS.enc.Utf8);
    });
    this.routepath = RouterPath;
  }
  ngOnInit(): void {
    this.onSearchClick();
    this.fetchData();
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

  onPageChange(event) {
    console.log(event);
    this.currentPage = event;
    this.startRow = (this.currentPage - 1) * this.pageSize;
    this.onSearchClick();
  }

  onSearchClick(ispush = false) {
    const searcharr = [];

    searcharr.push({ $eq: [{ $toString: "$customer_id" }, this.paramId] });
    searcharr.push({ $eq: ["$document_type", "j"] });
    searcharr.push({ $ne: ["$status", JStatus.close] });
    searcharr.push({ $ne: ["$status", JStatus.cancel] });

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
      this.dataSourceCount = d.count;

      this.dataSource = d.results.map((d) => {
        const cursenddate = moment(d.created).tz(this.shareService.tz);
        d.created = cursenddate.format("D/M/YYYY");
        d.enc_id = this.endCryptId(d._id);
        return d;
      });
      this.changeDetectorRef.detectChanges();
    });
  }

  endCryptId(id) {
    return EncodeSpacialC(CryptoJS.AES.encrypt(id, environment.encPassword).toString());
  }
}
