import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
} from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup } from "@angular/forms";
import { RouterPath, User } from "src/app/_models";
import { AuthenticationService, CustomerService, ShareService } from "src/app/_services";
import * as _moment from "moment-timezone";
const moment = _moment;

@Component({
  selector: 'app-customer-sharelink',
  templateUrl: './customer-sharelink.component.html',
  styleUrls: ['./customer-sharelink.component.scss']
})
export class CustomerSharelinkComponent implements OnInit {
  routepath: any;
  modalRef: BsModalRef;

  displayedColumns = [
    "register_date",
    "customer_name",
    "phone",
    "message",
    "action",
  ];
  dataSource: any = [];

  dataForm: FormGroup;
  currentUser: User;

  groupfilter = "";
  groups: string[] = [];

  deleteElement: any = null;
  deleteResult = false;

  searchtype = "";
  clipboardurl = "";

  sorting = { modified: -1 };
  startRow = 0;
  pageSize = 20;
  dataSourceCount = 0;
  dataSourceLoading = false;
  currentPage = 1;

  dlgloading = false;
  dlgerror = "";
  dlgmsgok = "";

  constructor(
    private authenticationService: AuthenticationService,
    private customerService: CustomerService,
    private changeDetectorRef: ChangeDetectorRef,
    private shareService: ShareService,
    private modalService: BsModalService,
  ) {
    this.authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );
    this.routepath = RouterPath;
  }

  ngOnInit(): void {
    this.onSearchClick();
    this.fetchShareLink();
    // this.searchtype = "customer_code";
  }

  // onPageChange(event) {
  //   console.log(event);
  //   this.currentPage = event;
  //   this.startRow = (this.currentPage - 1) * this.pageSize;
  //   this.onSearchClick();
  // }
  fetchShareLink() {
      this.customerService
        .getShareLink()
        .subscribe((data: any) => {
          //console.log(data);
          this.clipboardurl = data.url;
          this.changeDetectorRef.detectChanges();
        });

  }

  onSearchClick(ispush = false) {
    const searcharr = [];

    searcharr.push({ $ne: ["$is_approve", true] });

    // if (this.searchtext) {
    //   searcharr.push({
    //     $regexMatch: {
    //       input: { $toLower: `$${this.searchtype}` },
    //       regex: `.*${this.searchtext.toLowerCase()}.*`,
    //     },
    //   });
    // }
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

      this.dataSource = d.results.map((d) => {
        const cursenddate = moment(d.created).tz(this.shareService.tz);
        d.created = cursenddate.format("D/M/YYYY");
        return d;
      });

      this.changeDetectorRef.detectChanges();
    });
  }

  onDelete() {
    this.dlgloading = true;
    this.deleteResult = true;
    this.dlgerror = "";
    this.customerService.delete(this.deleteElement._id).subscribe(
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
    this.dlgloading = false;
    this.modalRef.hide();
  }

}
