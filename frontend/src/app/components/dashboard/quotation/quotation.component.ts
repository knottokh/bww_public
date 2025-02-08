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
import { RouterPath, User, QStatus } from "src/app/_models";
import { AuthenticationService, QuotationService } from "src/app/_services";
import * as moment from "moment-timezone";

@Component({
  selector: "app-quotation",
  templateUrl: "./quotation.component.html",
  styleUrls: ["./quotation.component.scss"],
})
export class QuotationComponent implements OnInit {
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
    // "remark",
  ];
  dataSource: any = [];

  qstatus: any = QStatus;

  dataForm: FormGroup;
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

  init = true;

  ua = navigator.userAgent;

  constructor(
    private authenticationService: AuthenticationService,
    private modalService: BsModalService,
    private quotationService: QuotationService,
    private changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );
    this.dataForm = this.fb.group({
      _id: [""],
      title: ["", Validators.required],
    });
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
        "title",
        "customer_name",
        // "remark",
      ];
    }
  }

  onPageChange(event) {
    console.log(event);
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
    var _regex;
    searcharr.push({ $eq: ["$document_type", "q"] });

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

    if (this.init) {
      searcharr.push({ $eq: ["$status", this.qstatus.waiting] });
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
        let product_code = "";
        if (d.stocks.length > 0) {
          d.stocks.map((s) => {
            product_code += s.stock_code + ", ";
          });
          if (product_code.length > 0) {
            product_code = product_code.substring(0, product_code.length - 2);
          }
          d.product_code = product_code;
        }
        return d;
      });

      // console.log("datasource", this.dataSource);
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

  get f() {
    return this.dataForm.controls;
  }

  resetClick() {
    this.searchtype = "quotation_code";
    this.searchtext = "";
    this.onSearchClick((this.init = true));
  }

  onSaveData() {
    this.dlgloading = true;
    this.dlgerror = "";
    //console.log(img);
    let shareData: any = {
      title: this.f.title.value,
    };

    let service = this.quotationService.add(
      Object.assign(shareData, {
        createdby: this.currentUser.fullname,
      })
    );
    let isnew = true;
    if (this.f._id.value && this.f._id.value !== "") {
      isnew = false;
      service = this.quotationService.update(
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

  onEdit(template: TemplateRef<any>, element: any) {
    this.f._id.setValue(element._id);
    this.f.title.setValue(element.title);
    this.openModal(template);
  }

  onDelete() {
    this.dlgloading = true;
    this.deleteResult = true;
    this.dlgerror = "";
    this.quotationService.delete(this.deleteElement._id).subscribe(
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
      //this.dataSource.paginator.firstPage();
      //this.dataSource.paginator.pageSize = 2;
      //this.dataSource.paginator.length = this.dataSource.filteredData.length;
      //this.paginator1.pageIndex = 0;
      //this.paginator1.page.next();
      //this.paginator1.length = this.dataSource.filteredData.length;
      //this.paginator1.page.next();
      //this.changeDetectorRef.detectChanges();
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
      title: ["", Validators.required],
    });
    this.dlgloading = false;
    this.modalRef.hide();
  }
}
