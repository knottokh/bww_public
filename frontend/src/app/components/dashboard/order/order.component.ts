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
import { AuthenticationService, QuotationService } from "src/app/_services";
import * as moment from 'moment-timezone';
import { JLocation, JStatus } from "src/app/_models/jstatus";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  routepath: any;
  modalRef: BsModalRef;
  //modalRef2: BsModalRef;
  //@ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  //@ViewChild(MatSort) sort: MatSort;

  displayedColumns = [
    "title",
    "customer_code",
    "customer_name",
    "created",
    "status",
    "product_code",
    // "remark"
  ];
  dataSource: any = [];

  currentUser: User;

  dlgloading = false;
  dlgerror = "";
  dlgmsgok = "";

  groupfilter = "";
  groups: string[] = [];

  deleteElement: any = null;
  deleteResult = false;

  searchtype = "";
  searchtext = "";

  sorting = { modified: -1 };
  startRow = 0;
  pageSize = 20;
  dataSourceCount = 0;
  dataSourceLoading = false;
  currentPage = 1;

  jstatus: any = JStatus;

  init = true;

  ua = navigator.userAgent;

  constructor(
    // private authenticationService: AuthenticationService,
    // private modalService: BsModalService,
    private quotationService: QuotationService,
    private changeDetectorRef: ChangeDetectorRef,
    // private fb: FormBuilder
  ) {

    this.routepath = RouterPath;
  }

  ngOnInit(): void {
    this.searchtype = "quotation_code";
    this.onSearchClick();
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(this.ua))
    {
      this.displayedColumns = [
        "title",
        "customer_name",
        "status"
      ];
    }
  }

  onPageChange(event) {
    console.log(event);
    this.currentPage = event;
    this.startRow = (this.currentPage - 1) * this.pageSize;
    this.onSearchClickEvent();
  }

  onSearchClick(ispush = false){
    this.currentPage = 1;
    this.startRow = 0;
    this.onSearchClickEvent(ispush);
  }

  onSearchClickEvent(ispush = false, init?) {
    const searcharr = [];
    var _regex;
    searcharr.push({ $eq: ["$document_type", "j"] });
    if (this.searchtext) {
      _regex = this.searchtype === "quotation_code" ? `${this.searchtext.toLowerCase()}$` : `.*${this.searchtext.toLowerCase()}.*`;
      searcharr.push({
        $regexMatch: {
          input: { $toLower: `$${this.searchtype}` },
          regex: _regex,
        },
      });
    }

    this.init = init || this.init;

    if(this.init) {
      searcharr.push({$ne: ["$status", this.jstatus.close]});
      searcharr.push({$ne: ["$status", this.jstatus.cancel]});
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

      this.dataSource = d.results.map(d => {
        const created = d.created;
        d.created = moment(created).format('DD/MM/YYYY');
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

  resetClick() {
    this.searchtype = "quotation_code";
    this.searchtext = "";
    this.onSearchClick(this.init = true);
  }

}
