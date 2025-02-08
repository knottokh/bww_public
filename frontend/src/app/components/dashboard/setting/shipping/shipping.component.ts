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
import { AuthenticationService, ShippingService } from "src/app/_services";

@Component({
  selector: "app-shipping",
  templateUrl: "./shipping.component.html",
  styleUrls: ["../setting.component.scss", "./shipping.component.scss"],
})
export class ShippingComponent implements OnInit {
  routepath: any;

  modalRef: BsModalRef;
  //modalRef2: BsModalRef;
  //@ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  //@ViewChild(MatSort) sort: MatSort;

  displayedColumns = ["order", "title", "action"];
  dataSource: any = [];

  dataForm: FormGroup;
  currentUser: User;

  dlgloading = false;
  dlgerror = "";
  dlgmsgok = "";

  groupfilter = "";
  groups: string[] = [];

  deleteElement: any = null;
  deleteResult = false;

  sorting = { sequence: 1 };
  startRow = 0;
  pageSize = 100;
  dataSourceCount = 0;
  dataSourceLoading = false;
  currentPage = 1;

  constructor(
    private authenticationService: AuthenticationService,
    private modalService: BsModalService,
    private shippingService: ShippingService,
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
    this.onSearchClick();
  }

  onPageChange(event) {
    console.log(event);
    this.currentPage = event;
    this.startRow = (this.currentPage - 1) * this.pageSize;
    this.onSearchClick();
  }

  onSearchClick(ispush = false) {
    const searcharr = [];

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
    this.shippingService.findBy(search).subscribe((d: any) => {
      this.dataSourceCount = d.count;

      this.dataSource = d.results;
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

  onSaveData() {
    this.dlgloading = true;
    this.dlgerror = "";
    //console.log(img);
    let shareData: any = {
      title: this.f.title.value,
    };

    let service = this.shippingService.add(
      Object.assign(shareData, {
        createdby: this.currentUser.fullname,
      })
    );
    let isnew = true;
    if (this.f._id.value && this.f._id.value !== "") {
      isnew = false;
      service = this.shippingService.update(
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

  swapIndex(a, m, n){
    //console.log(a, m, n);
    [a[m], a[n]] = [a[n], a[m]];
    //this.changeDetectorRef.detectChanges();
    this.shippingService.update_sequence(a).subscribe(
      (data: any) => {
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
    this.shippingService.delete(this.deleteElement._id).subscribe(
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
