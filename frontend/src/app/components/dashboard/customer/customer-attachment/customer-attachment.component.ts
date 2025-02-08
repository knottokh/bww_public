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
import { RouterPath, UploadImage, User } from "src/app/_models";
import {
  AuthenticationService,
  AttachmentService,
  UploadService,
  ShareService,
} from "src/app/_services";
import { ImagegridService } from "src/app/_services/imagegrid.service";
import { forkJoin } from "rxjs";
import { ActivatedRoute, Params } from "@angular/router";
import * as _moment from "moment-timezone";
const moment = _moment;

@Component({
  selector: "app-customer-attachment",
  templateUrl: "./customer-attachment.component.html",
  styleUrls: [
    "../customer.component.scss",
    "./customer-attachment.component.scss",
  ],
})
export class CustomerAttachmentComponent implements OnInit {
  routepath: any;

  modalRef: BsModalRef;

  paramId: string;

  searchtext = "";
  //modalRef2: BsModalRef;
  //@ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  //@ViewChild(MatSort) sort: MatSort;

  displayedColumns = ["document_name", "created", "remark", "action"];
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

  files: any = [];
  progress: any;
  messages: any;

  constructor(
    private authenticationService: AuthenticationService,
    private modalService: BsModalService,
    private attachmentService: AttachmentService,
    private changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private imagegridService: ImagegridService,
    private uploadService: UploadService,
    public route: ActivatedRoute,
    private shareService: ShareService
  ) {
    this.authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );
    this.route.params.subscribe((params: Params) => {
      this.paramId = params.withId;
    });
    this.dataForm = this.fb.group({
      _id: [""],
      document_name: ["", Validators.required],
      remark: [""],
      document: [""],
    });
    this.routepath = RouterPath;
  }
  ngOnInit(): void {
    this.onSearchClick();
  }

  getFileUrl(filename) {
    return this.imagegridService.getFileUrl(filename);
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

    if (this.searchtext) {
      searcharr.push({
        $regexMatch: {
          input: { $toLower: `$document_name` },
          regex: `.*${this.searchtext.toLowerCase()}.*`,
        },
      });
    }

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

  onClickNewTab(url) {
    window.open(url);
  }

  fetchData(search) {
    this.dataSourceLoading = true;
    this.attachmentService.findBy(search).subscribe((d: any) => {
      this.dataSourceCount = d.count;

      this.dataSource = d.results.map((d) => {
        const cursenddate = moment(d.created).tz(this.shareService.tz);
        d.created = cursenddate.format("D/M/YYYY");
        return d;
      });

      console.log("this.dataSource", this.dataSource);
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

  uploadFile(event) {
    if (event.length > 0) {
      this.files = [];
      //this.f.document.setValue('0');
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < 1; index++) {
        const element = event[index];
        const mimeType = element.type;
        //if (mimeType.match(/image\/*/) !== null) {
        const reader = new FileReader();
        reader.onload = (event) => {
          // console.log(event);
          // console.log('readfiles event ===== ',event);
          // tslint:disable-next-line: prefer-const
          let image = new UploadImage();
          // tslint:disable-next-line: prefer-const
          let fileReader = event.target as FileReader;
          image.id = "0";
          image.src = fileReader.result;
          image.name = element.name;
          image.file = element;
          // this.imageDrop.nativeElement.appendChild(image);
          this.files.push(image);
        };
        reader.readAsDataURL(element);
        //}
      }
    } else {
      // this.f.document.setValue('');
    }
  }

  uploadDocuments(callback) {
    let filternewfile = this.files.filter((file: UploadImage) => {
      return file.id === "0";
    });

    if (filternewfile.length > 0) {
      this.messages = {};
      // start the upload and save the progress map
      this.progress = this.uploadService.uploaddb(filternewfile, null, "");
      //console.log(this.progress);
      for (const key in this.progress) {
        // this.progress[key].progress.subscribe(val => console.log(val));
        this.progress[key].resresult.subscribe((val) => {
          //console.log(val)
          this.messages[key] = val;
        });
      }
      //console.log(this.progress);
      // convert the progress map into an array
      let allProgressObservables = [];
      for (let key in this.progress) {
        allProgressObservables.push(this.progress[key].progress);
      }

      // When all progress-observables are completed...
      forkJoin(allProgressObservables).subscribe((end) => {
        //console.log(end);
        //console.log(this.progress);
        callback(this.messages);
      });
    } else {
      callback(null);
    }
  }

  onSaveData() {
    this.dlgloading = true;
    this.dlgerror = "";
    //console.log(img);
    this.uploadDocuments((imgs) => {
      let shareData: any = {
        document_name: this.f.document_name.value,
        remark: this.f.remark.value,
        customer_id: this.paramId,
      };

      if (imgs !== null) {
        let imagearr = [];
        Object.keys(imgs).forEach((m) => {
          imagearr.push(imgs[m]);
        });
        shareData.document = imagearr.join("");
      }

      let service = this.attachmentService.add(
        Object.assign(shareData, {
          createdby: this.currentUser.fullname,
        })
      );
      let isnew = true;
      if (this.f._id.value && this.f._id.value !== "") {
        isnew = false;
        service = this.attachmentService.update(
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
    });
  }

  onDelete() {
    this.dlgloading = true;
    this.deleteResult = true;
    this.dlgerror = "";
    this.attachmentService.delete(this.deleteElement._id).subscribe(
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
    this.dataForm = this.fb.group({
      _id: [""],
      document_name: ["", Validators.required],
      remark: [""],
      document: [""],
    });
    this.dlgloading = false;
    this.modalRef.hide();
  }

  resetClick() {
    this.searchtext = "";
  }
}
