import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { RouterPath, User, Unit } from "src/app/_models";
import {
  AuthenticationService,
  StockService,
  UploadService,
} from "src/app/_services";
import { map, startWith } from "rxjs/operators";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-product",
  templateUrl: "./product.component.html",
  styleUrls: ["../setting.component.scss", "./product.component.scss"],
})
export class ProductComponent implements OnInit {
  routepath: any;

  modalRef: BsModalRef;
  //modalRef2: BsModalRef;
  //@ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  //@ViewChild(MatSort) sort: MatSort;

  displayedColumns = [
    "order",
    "stock_code",
     "title",
    // "stock_type",
    "product_code",
    "product_unit",
    "product_weight",
    "action",
  ];

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

  searchtype = "stock_code";
  searchtext = "";

  sorting = { sequence: 1 };
  startRow = 0;
  pageSize = 20;
  dataSourceCount = 0;
  dataSourceLoading = false;
  currentPage = 1;

  stockTypeOptions: any = [];
  filterStockTypeOptions: any = [];

  unitOptions: any = [];
  filterunitOptions: any = [];

  stocktypes: any = ["สั่งผลิต", "สั่งผลิต(1D)"];
  units: any = [];
  //stock_type = 'สั่งผลิต';

  @ViewChild("file") file;
  lastpath: string = "imports/import-with-body";

  public files: Set<File> = new Set();
  public importmessages: any;
  progress;
  canBeClosed = true;

  exportDataSource: any = [];
  percenLoading = 0;
  exportPageSize = 10000;
  exportColumns = [
    "stock_code",
    "title",
    "stock_type",
    "price",
    "unit",
    "product_code",
    "product_unit",
    "product_weight",
  ];
  filetext = "";
  uploading = false;
  uploadSuccessful = false;
  errorparse = "";
  bodyTextObj = `{
    "table_name": "bww_stocks",
    "filter_columns" : [{ "title": "รหัสสินค้า", "name": "stock_code" }],
    "update_columns" : [
      { "title": "รหัสสินค้า", "name": "stock_code" },
      { "title": "ชื่อสินค้า", "name": "title" },
      { "title": "ประเภท", "name": "stock_type" },
      { "title": "ราคาพื้นฐาน", "name": "price" },
      { "title": "หน่วย", "name": "unit" },
      { "title": "รหัสการผลิต", "name": "product_code" },
      { "title": "หน่วยผลิต", "name": "product_unit" },
      { "title": "น้ำหนัก", "name": "product_weight" }
    ],
    "refs": []
  }`;

  constructor(
    private authenticationService: AuthenticationService,
    private modalService: BsModalService,
    private stockService: StockService,
    private uploadService: UploadService,
    private changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );
    this.dataForm = this.fb.group({
      _id: [""],
      stock_code: ["", Validators.required],
      title: ["", Validators.required],
      stock_type: ["", Validators.required],
      price: ["", Validators.required],
      unit: ["", Validators.required],
      product_code: ["", Validators.required],
      product_unit: ["", Validators.required],
      product_weight: [""],
    });
    this.routepath = RouterPath;
    this.units = Object.keys(Unit).map((m) => Unit[m]);
  }

  // private _filter_stock_type(value: string): string[] {
  //   const filterValue = value.toLowerCase();

  //   return this.stockTypeOptions.filter((option) =>
  //     option.toLowerCase().includes(filterValue)
  //   );
  // }

  private _filter_unit(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.unitOptions.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  ngOnInit(): void {
    this.onSearchClick();
    this.loadDropdown();
  }

  loadDropdown() {
    // this.stockService.getStockTypes().subscribe((d: any) => {
    //   this.stockTypeOptions = d;
    //   this.filterStockTypeOptions =
    //     this.dataForm.controls.stock_type.valueChanges.pipe(
    //       startWith(""),
    //       map((value) => this._filter_stock_type(value))
    //     );
    //   this.changeDetectorRef.detectChanges();
    // });
    this.stockService.getUnits().subscribe((d: any) => {
      this.unitOptions = d;
      this.filterunitOptions = this.dataForm.controls.unit.valueChanges.pipe(
        startWith(""),
        map((value) => this._filter_unit(value))
      );
      this.changeDetectorRef.detectChanges();
    });
  }

  onPageChange(event) {
    console.log(event);
    this.currentPage = event;
    this.startRow = (this.currentPage - 1) * this.pageSize;
    this.onSearchClick();
  }

  onSearchClick(isExport = false, cb?) {
    const searcharr = [];

    let stocttypearr = [{ $eq: ["$stock_type", "สั่งผลิต"] }];
    stocttypearr.push({ $eq: ["$stock_type", "สั่งผลิต(1D)"] });
    searcharr.push({
      $or: stocttypearr,
    });
    var _regex;
    if (this.searchtext) {
      _regex = `.*${this.searchtext.trim().toLowerCase()}.*`;
      searcharr.push({
        $regexMatch: {
          input: { $toLower: `$${this.searchtype}` },
          regex: _regex,
        },
      });
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
    if (!isExport) {
      this.fetchData(search);
    } else {
      this.exportDataSource = [];
      this.fetchDataForExport(search, false, cb);
    }
  }

  fetchData(search) {
    this.dataSourceLoading = true;
    this.stockService.findBy(search).subscribe((d: any) => {
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

  fetchDataForExport(search, ispush, cb) {
    if (this.exportDataSource.length == 0 || ispush) {
      if (!ispush) {
        this.percenLoading = 0;
        search["startRow"] = 0;
        search["endRow"] = this.exportPageSize;
      }
      this.stockService.findBy(search).subscribe((d: any) => {
        // console.log("fetchDataForExport",d.results.length);
        // console.log("fetchDataForExport",this.exportDataSource.length);
        //const startseq = this.exportDataSource.length;
        const mapresult = d.results;
        if (!ispush) {
          this.exportDataSource = mapresult;
        } else {
          this.exportDataSource = this.exportDataSource.concat(mapresult);
        }
        this.percenLoading = Math.ceil(
          (this.exportDataSource.length / parseFloat(d.count)) * 100
        );
        //console.log("percenLoading", this.percenLoading);
        this.changeDetectorRef.detectChanges();
        // console.log("this.exportDataSource.length", this.exportDataSource.length);
        // console.log(" d.count",  d.count);
        //if (this.exportDataSource.length < 20000) {
        if (this.exportDataSource.length < d.count) {
          search.startRow = this.exportDataSource.length;
          this.fetchDataForExport(search, true, cb);
        } else {
          this.percenLoading = 100;
          this.changeDetectorRef.detectChanges();
          if (cb) {
            cb(true);
          }
        }
      });
    } else {
      if (cb) {
        cb(true);
      }
    }
  }

  get f() {
    return this.dataForm.controls;
  }

  onSaveData() {
    this.dlgloading = true;
    this.dlgerror = "";
    //console.log(img);
    let shareData: any = {
      stock_code: this.f.stock_code.value,
      title: this.f.title.value,
      stock_type: this.f.stock_type.value,
      price: this.f.price.value,
      unit: this.f.unit.value,
      product_code: this.f.product_code.value,
      product_unit: this.f.product_unit.value,
      product_weight: this.f.product_weight.value,
    };

    let service = this.stockService.add(
      Object.assign(shareData, {
        createdby: this.currentUser.fullname,
      })
    );
    let isnew = true;
    if (this.f._id.value && this.f._id.value !== "") {
      isnew = false;
      service = this.stockService.update(
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
        this.loadDropdown();
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
    this.stockService.update_sequence(a).subscribe(
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
    this.f.stock_code.setValue(element.stock_code);
    this.f.title.setValue(element.title);
    this.f.stock_type.setValue(element.stock_type);
    this.f.price.setValue(element.price);
    this.f.unit.setValue(element.unit);
    this.f.product_code.setValue(element.product_code);
    this.f.product_unit.setValue(element.product_unit);
    this.f.product_weight.setValue(element.product_weight);
    this.openModal(template);
  }

  onDelete() {
    this.dlgloading = true;
    this.deleteResult = true;
    this.dlgerror = "";
    this.stockService.delete(this.deleteElement._id).subscribe(
      (data: any) => {
        this.onSearchClick();
        this.loadDropdown();
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
      stock_code: ["", Validators.required],
      title: ["", Validators.required],
      stock_type: ["", Validators.required],
      price: ["", Validators.required],
      unit: ["", Validators.required],
      product_code: ["", Validators.required],
      product_unit: ["", Validators.required],
      product_weight: [""],
    });
    this.dlgloading = false;
    this.modalRef.hide();
  }

  addFiles() {
    this.file.nativeElement.click();
  }

  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;
    for (let key in files) {
      if (!isNaN(parseInt(key))) {
        let curfile = files[key];
        let ext = curfile.name.split(".")[1];
        if (ext.toLocaleLowerCase() === "xlsx") {
          this.files.clear();
          this.files.add(curfile);
          //this.filetext = '';
          this.filetext = curfile.name;
          //this.filetext.nativeElement.value = curfile.name;
          this.file.nativeElement.value = "";
          // this.progress[curfile.name] = {};
        }
      }
    }
  }

  onImportData3() {
    //alert('imported');

    let passtryparse = false;
    this.errorparse = "";
    let jsondata = {};
    try {
      jsondata = JSON.parse(this.bodyTextObj);
      console.log("jsondata", jsondata);
      passtryparse = true;
    } catch (e) {
      this.errorparse = e.message;
    }

    if (this.files.size > 0 && passtryparse) {
      //this.openModal(template);
      // set the component state to "uploading"
      this.importmessages = {};
      this.uploading = true;

      //let contactprops = ['positon', 'name', 'exphone', 'inphone', 'mobile', 'email', 'remark']
      // let excelkeys = {};
      // for (const key in this.importprops) {
      //   excelkeys[this.excelheader[key]] = this.importprops[key];
      // }

      // start the upload and save the progress map
      this.progress = this.uploadService.uploaddbFileWithGroupType(
        this.files,
        "",
        JSON.stringify(jsondata),
        this.lastpath
      );
      //console.log(this.progress);
      for (const key in this.progress) {
        //this.progress[key].progress.subscribe(val => console.log(val));
        this.progress[key].resresult.subscribe((val) => {
          //console.log(val)
          this.importmessages[key] = val;
        });
      }
      //console.log(this.progress);
      // convert the progress map into an array
      let allProgressObservables = [];
      for (let key in this.progress) {
        allProgressObservables.push(this.progress[key].progress);
      }

      // Adjust the state variables

      // The OK-button should have the text "Finish" now
      //this.primaryButtonText = 'อัพโหลดสำเร็จ';

      // The dialog should not be closed while uploading
      this.canBeClosed = false;

      // Hide the cancel-button
      //this.showCancelButton = false;

      // When all progress-observables are completed...
      forkJoin(allProgressObservables).subscribe(
        (end) => {
          console.log(end);
          // ... the dialog can be closed again...
          this.canBeClosed = true;

          // ... the upload was successful...
          this.uploadSuccessful = true;

          // ... and the component is no longer uploading
          this.uploading = false;
          this.filetext = "";
        },
        (error) => {
          console.log(error);
          this.canBeClosed = true;

          // ... the upload was successful...
          this.uploadSuccessful = true;

          // ... and the component is no longer uploading
          this.uploading = false;
          this.filetext = "";
        }
      );
    }
  }

  openModalAlert(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-md modal-adj modal-dialog-centered",
      backdrop: "static",
    });
    //this.changeDetectorRef.detectChanges();
  }
  declineAlert(isreload = false): void {
    this.modalRef.hide();
    if (isreload) {
      this.onSearchClick();
    }
  }

  exportExcel() {
    this.showExportDlg((r) => {
      if (r) {
        setTimeout(() => {
          document.getElementById("hiddenBtnExport").click();
        }, 1000);
      } else {
        this.hideExportDlg();
      }
    });
  }

  showExportDlg(cb?): void {
    document.getElementById("hiddenExportingShow").click();
    this.onSearchClick(true, cb);
  }
  hideExportDlg(): void {
    document.getElementById("hiddenExportingHide").click();
  }

  resetClick() {
    this.searchtype = "stock_code";
    this.searchtext = "";
    this.onSearchClick();
  }
}
