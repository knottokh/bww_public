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
import { Role, RouterPath, User } from "src/app/_models";
import { AuthenticationService, AccountService } from "src/app/_services";
import { MustMatch } from "src/app/_helpers";

@Component({
  selector: "app-account",
  templateUrl: "./account.component.html",
  styleUrls: ["../setting.component.scss", "./account.component.scss"],
})
export class AccountComponent implements OnInit {
  routepath: any;

  modalRef: BsModalRef;
  //modalRef2: BsModalRef;
  //@ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  //@ViewChild(MatSort) sort: MatSort;

  displayedColumns = ["username", "fullname", 'display_role', "email", "action"];
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

  sorting = { modified: -1 };
  startRow = 0;
  pageSize = 20;
  dataSourceCount = 0;
  dataSourceLoading = false;
  currentPage = 1;

  constructor(
    private authenticationService: AuthenticationService,
    private modalService: BsModalService,
    private accountService: AccountService,
    private changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );
    this.dataForm = this.fb.group(
      {
        _id: [""],
        username: ["", Validators.required],
        fullname: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        display_role: ["", Validators.required],
        password: ["", Validators.required],
        confirmPassword: ["", Validators.required],
      },
      {
        validator: MustMatch("password", "confirmPassword"),
      }
    );
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
    searcharr.push({ $eq: ["$role", Role.Admin] });
    searcharr.push({ $eq: ["$role", Role.SuperAdmin] });
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
      serach["filter"] = { $or: searcharr };
    } else {
      serach["filter"] = {};
    }
    this.fetchData(serach);
  }

  fetchData(search) {
    this.dataSourceLoading = true;
    this.accountService.findBy(search).subscribe((d: any) => {
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
      username: this.f.username.value,
      fullname: this.f.fullname.value,
      email: this.f.email.value,
      display_role: this.f.display_role.value,

    };

    if(this.f.password.value && this.f.password.value != ""){
      Object.assign(shareData, {
        password: this.f.password.value,
      });
    }

    let service = this.accountService.add(
      Object.assign(shareData, {
        createdby: this.currentUser.fullname,
      })
    );
    let isnew = true;
    if (this.f._id.value && this.f._id.value !== "") {
      isnew = false;
      service = this.accountService.update(
        this.f._id.value,
        Object.assign(shareData, {
          modifiedby: this.currentUser.fullname,
        })
      );
    } else {
      Object.assign(shareData, {
        role: Role.Admin,
      });
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
    this.f.username.setValue(element.username);
    this.f.fullname.setValue(element.fullname);
    this.f.email.setValue(element.email || '');
    this.f.display_role.setValue(element.display_role || '');
    this.f.password.setValidators([]);
    this.f.confirmPassword.setValidators([]);
    this.openModal(template);
  }

  onDelete() {
    this.dlgloading = true;
    this.deleteResult = true;
    this.dlgerror = "";
    this.accountService.delete(this.deleteElement._id).subscribe(
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
    this.dataForm = this.fb.group(
      {
        _id: [""],
        username: ["", Validators.required],
        fullname: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        display_role: ["", Validators.required],
        password: ["", Validators.required],
        confirmPassword: ["", Validators.required],
      },
      {
        validator: MustMatch("password", "confirmPassword"),
      }
    );
    this.dlgloading = false;
    this.modalRef.hide();
  }
}
