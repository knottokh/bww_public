import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { RouterPath, User } from "src/app/_models";
import { AuthenticationService, CustomerService } from "src/app/_services";

@Component({
  selector: "app-customer",
  templateUrl: "./customer.component.html",
  styleUrls: ["./customer.component.scss"],
})
export class CustomerComponent implements OnInit {
  routepath: any;

  displayedColumns = [
    "customer_code",
    "customer_name",
    "phone",
    "payment_type",
    "shipping",
    "onprogress_order",
  ];
  dataSource: any = [];

  dataForm: FormGroup;
  currentUser: User;

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

  ua = navigator.userAgent;

  constructor(
    private authenticationService: AuthenticationService,
    private customerService: CustomerService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );
    this.routepath = RouterPath;
  }

  ngOnInit(): void {
    this.onSearchClick();
    this.searchtype = "customer_code";
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(this.ua))
    {
      this.displayedColumns = [
        "customer_code",
        "customer_name"
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

  onSearchClickEvent(ispush = false) {
    const searcharr = [];

    searcharr.push({ $eq: ["$is_approve", true] });

    if (this.searchtext) {
      searcharr.push({
        $regexMatch: {
          input: { $toLower: `$${this.searchtype}` },
          regex: `.*${this.searchtext.toLowerCase()}.*`,
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
    this.fetchData(serach);
  }

  fetchData(search) {
    this.dataSourceLoading = true;
    this.customerService.findBy(search).subscribe((d: any) => {
      this.dataSourceCount = d.count;

      this.dataSource = d.results.map((m: any) => {
          m.onprogress_orders = (m.jobs || []).map((h:any) => h.quotation_code).join(', ')

          return m;
      });
      //console.log("this.dataSource", this.dataSource);

      this.changeDetectorRef.detectChanges();
    });
  }

  resetClick() {
    this.searchtype = "customer_code";
    this.searchtext = "";
    this.onSearchClick();
  }
}
