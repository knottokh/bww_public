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
  QuotationAttachmentService,
  QuotationService,
  ShareService,
} from "src/app/_services";
import { ActivatedRoute, Params, Router } from "@angular/router";
import * as _moment from "moment-timezone";
import { DecodeSpacialC } from "src/app/_helpers";
import { JStatus } from "src/app/_models/jstatus";
import { ImagegridService } from "src/app/_services/imagegrid.service";
const moment = _moment;

@Component({
  selector: 'app-customer-viewtask',
  templateUrl: './customer-viewtask.component.html',
  styleUrls: ['./customer-viewtask.component.scss']
})
export class CustomerViewtaskComponent implements OnInit {


  routepath: any;
  customerId: string;
  paramId: string;

  displayedColumns = ["title", "quantity", "unit", "price", "total_price"];
  dataSource: any = [];

  currentUser: User;

  dlgloading = false;
  dlgerror = "";
  dlgmsgok = "";

  deleteResult = false;

  sorting = { modified: -1 };
  startRow = 0;
  pageSize = 9999;
  dataSourceCount = 0;
  dataSourceLoading = false;
  currentPage = 1;

  currentCustomerData: any = {};

  currentQuotationData: any = {};

  displayedAttachColumns = ["document_name"];
  dataSourceAttach: any = [];

  constructor(
    private authenticationService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef,
    public route: ActivatedRoute,
    public router: Router,
    private customerService: CustomerService,
    private quotationService: QuotationService,
    private shareService: ShareService,
    private imagegridService: ImagegridService,
    private quotationAttachmentService: QuotationAttachmentService,
  ) {
    this.authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );
    this.routepath = RouterPath;
    console.log("here");
    this.route.params.subscribe((params: Params) => {
      this.paramId = CryptoJS.AES.decrypt(DecodeSpacialC(params.withId), environment.encPassword).toString(CryptoJS.enc.Utf8);
    });
  }

  ngOnInit(): void {
    this.fetchQuotationData();
    this.fetchAttachmentData();
  }

  getFileUrl(filename) {
    return this.imagegridService.getFileUrl(filename);
  }

  onClickNewTab(url) {
    window.open(url);
  }

  fetchCustomerData() {
    if (this.customerId && this.customerId !== "") {
      //this.firstload = true;
      this.customerService.getById(this.customerId).subscribe((data: any) => {
        //console.log(data);
        this.currentCustomerData = data;

        //this.firstload = false;
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  fetchQuotationData() {
    if (this.paramId && this.paramId !== "") {
      //this.firstload = true;
      this.quotationService.getById(this.paramId).subscribe((data: any) => {
        //console.log(data);
        data.createdTxt = moment(data.created).format("DD/MM/YYYY HH:mm");
        this.currentQuotationData = data;
        this.customerId = data.customer_id;
        this.fetchCustomerData();
        //this.firstload = false;
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  fetchAttachmentData() {
     const searcharr = [];

    searcharr.push({ $eq: [{ $toString: "$quotation_id" }, this.paramId] });


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
    this.dataSourceLoading = true;
    this.quotationAttachmentService.findBy(serach).subscribe((d: any) => {
      //this.dataSourceCount = d.count;

      this.dataSourceAttach = d.results.map((d) => {
        const cursenddate = moment(d.created).tz(this.shareService.tz);
        d.created = cursenddate.format("D/M/YYYY");
        return d;
      });
      this.changeDetectorRef.detectChanges();
    });
  }

  filterProduct(stock_id) {
    return (this.currentQuotationData.products || []).filter(f => f.quotation_stock_id.toString() == stock_id.toString());
  }

  calWeight() {
    let total_width: any = 0;
    if (this.currentQuotationData && this.currentQuotationData.stocks) {
      this.currentQuotationData.stocks.forEach(f => {
        if (f.stock_type == 'สั่งผลิต') {
          const products = this.filterProduct(f._id);
          products.forEach(product => {
            let width = 0;
            let height = 0;
            if (product.width) {
              width = product.width_m;
              // const oldw = math.unit(product.width_m, UnitEng[f.product_unit]);
              // width = parseFloat(oldw.toNumber(UnitEng['เมตร']).toFixed(3));
            }
            if (product.height) {
              height = product.height_m;
              // const oldh = math.unit(product.height_m, UnitEng[f.product_unit]);
              // height = parseFloat(oldh.toNumber(UnitEng['เมตร']).toFixed(3));
            }
            if (product.product_weight && product.quantity) {
              total_width += ((width * height) * product.quantity * product.product_weight);
            } else {
              total_width = 'Undefined';
            }
          });

        } else if (f.stock_type == 'สั่งผลิต(1D)') {
          if (f.product_weight && f.quantity) {
            total_width += (f.quantity * f.product_weight);
          } else {
            total_width = 'Undefined';
          }
        }
      });
    }
    return total_width
  }
}
