import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { RouterPath, Unit, UnitEng, UploadImage, User, Role } from "src/app/_models";
import {
  AuthenticationService,
  CustomerService,
  ShippingService,
  PaymentService,
  QuotationService,
  ShareService,
  UploadService,
  QuotationAttachmentService
} from "src/app/_services";
import * as _moment from "moment-timezone";
import { JLocation, JStatus } from "src/app/_models/jstatus";
import { forkJoin } from "rxjs";
import { ImagegridService } from "src/app/_services/imagegrid.service";
import * as math from "mathjs";
declare var jQuery: any;
const moment = _moment;

@Component({
  selector: 'app-order-view',
  templateUrl: './order-view.component.html',
  styleUrls: ['./order-view.component.scss']
})
export class OrderViewComponent implements OnInit {

  modalRef: BsModalRef;
  modalRef2: BsModalRef;

  quillStyle = {
    height: '100px'
  };
  quillviewStyle = {
    border: '0px'
  };
  quillConfig = {
    modules: {
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['link', 'image', 'video']
        ],
        handlers: {
          'image': function (image) {
            //console.log('image', image);
            if (image) {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');
              input.click();
              input.onchange = function () {
                const file = input.files[0];
                //console.log('User trying to uplaod this:', file);

                const reader = new FileReader();
                const range = this.quill.getSelection();
                const self = this;
                reader.addEventListener("load", function () {
                  // convert image file to base64 string
                  //console.log("self.quill.", self.quill);
                  // self.quill.insertEmbed(range.index, 'image', reader.result);
                  self.quill.pasteHTML(range.index, `<img class="c-img-100" src="${reader.result}"/>`);
                  //self.quill.insertEmbed(range, 'block', '<p><br></p>');
                  //self.quill.insertEmbed(range.index + 1, "break", true);
                  //self.quill.insertEmbed(range.index, 'br');
                }, false);

                if (file) {
                  reader.readAsDataURL(file);
                }

                //const id = await uploadFile(file); // I'm using react, so whatever upload function

                //const link = `${ROOT_URL}/file/${id}`;

                // this part the image is inserted
                // by 'image' option below, you just have to put src(link) of img here.

              }.bind(this);
            }
          }
        }
      }
      // toolbar: [
      //   [{ header: [1, 2, false] }],
      //   ['bold', 'italic', 'underline'],
      //   ['image', 'code-block'],
      //     {
      //       handlers: {
      //         image: (image) => {
      //           console.log('image', image);
      //         },
      //       },
      //     },
      //   ],
      // ],
    },
    theme: 'snow'  // or 'bubble'
  };

  dataFormAttach: FormGroup;

  routepath: any;
  customerId: string;
  paramId: string;

  // displayedColumns = ["title", "quantity", "unit", "price", "total_price"];
  // dataSource: any = [];

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

  is_saving: boolean = false;
  isedit_stock: boolean = false;
  isedit_ref: boolean = false;
  // isedit_illus: boolean = false;
  isedit_remark: boolean = false;
  is_cancelled: boolean = false;

  jloc: any = JLocation;
  jstatus: any = JStatus;
  //stock_type: string = 'สั่งผลิต';
  locations: any = [JLocation.loc1, JLocation.loc2, JLocation.loc3];
  //status: any = ['', JStatus.wating, JStatus.prcessing, JStatus.ready];

  old_document_ref: string = '';
  // old_illustration: string = '';
  old_remark: string = '';
  old_stocks: any = [];

  cancelRemark: any= null;

  files: any = [];
  progress: any;
  messages: any;

  deleteElement: any = null;
  displayedAttachColumns = ["document_name", "action"];
  dataSourceAttach: any = [];

  units: any = [];

  printStock: any = {};
  printProducts: any = [];


  constructor(
    private authenticationService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService,
    public route: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder,
    private customerService: CustomerService,
    private quotationService: QuotationService,
    private quotationAttachmentService: QuotationAttachmentService,
    private imagegridService: ImagegridService,
    private uploadService: UploadService,
    private shareService: ShareService
  ) {
    this.authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );
    this.routepath = RouterPath;
    this.route.params.subscribe((params: Params) => {
      this.customerId = params.withCustomerId;
      this.paramId = params.withId;
    });
    this.dataFormAttach = this.fb.group({
      _id: [""],
      document: [""],
    });
    console.log("jstatus", this.jstatus);
    this.units = Object.keys(Unit).map(m => Unit[m]);
  }

  ngOnInit(): void {
    this.fetchCustomerData();
    this.fetchQuotationData();
    this.onSearchAttachmentClick();
  }

  get f() {
    return this.dataFormAttach.controls;
  }

  removeTags(str) {
    if ((str === null) || (str === ''))
        return false;
    else
        str = str.toString();

    // Regular expression to identify HTML tags in
    // the input string. Replacing the identified
    // HTML tag with a null string.
    return str.replace(/(<([^>]+)>)/ig, '');
}

  getFileUrl(filename) {
    return this.imagegridService.getFileUrl(filename);
  }

  fetchCustomerData() {
    if (this.customerId && this.customerId !== "") {
      //this.firstload = true;
      this.customerService.getById(this.customerId).subscribe((data: any) => {
        //console.log(data);
        //data.createText = moment(data.created).format("DD/MM/YYYY HH:mm");
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
        data.onprogress_dateTxt = moment(data.created).format(this.shareService.viewdateformat);
        this.currentQuotationData = data;
        if (this.currentQuotationData.stocks.length > 0) {
          this.printStock = this.currentQuotationData.stocks[0];
          let products: any = [];
          let memboerProducts: any = [];
          this.currentQuotationData.products.forEach((p: any, inx: number) => {
            if (inx % 10 == 0) {
              if (memboerProducts.length > 0) {
                products.push(memboerProducts);
              }
              memboerProducts = [];
            }
            memboerProducts.push(p);
            if (inx == this.currentQuotationData.products.length - 1) {
              products.push(memboerProducts);
            }
          });
          if (this.printStock.stock_type == 'สั่งผลิต(1D)') {
            products.push(this.currentQuotationData.stocks);
          }

          this.printProducts = products;
          //console.log("this.printProducts", this.printProducts);
        }

        if (data.status != this.jstatus.close && data.status != this.jstatus.cancel && data.status != this.jstatus.ready && data.status != this.jstatus.prcessing) {
          this.isedit_stock = true;
        } else {
          this.isedit_stock = false;
        }
        if (data.status == this.jstatus.cancel) {
          this.is_cancelled = true;
        } else {
          this.is_cancelled = false;
        }

        //this.firstload = false;
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  filterProduct(stock_id) {
    return (this.currentQuotationData.products || []).filter(f => f.quotation_stock_id.toString() == stock_id.toString());
  }

  bindTitleOrCode(data: any) {
    return (data.title !== data.original_title && data.original_title !== null && data.original_title !== "" ? data.title : data.product_code);
  }
  // getProductByStockType() {
  //   return (this.currentQuotationData.stocks || []);
  // }

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
            // if (product.product_weight && product.quantity) {
            //   total_width += ((width * height) * product.quantity * product.product_weight);
            // } else {
            //   total_width = 'Undefined';
            // }
            if (product.quantity) {
              total_width += ((width * height) * product.quantity);
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

  onEdit(type) {
    switch (type) {
      case 'stock':
        console.log("this.currentQuotationData.stocks", this.currentQuotationData.stocks);
        this.old_stocks = [...this.currentQuotationData.stocks.map(m => {
          m.location = '';
          m.status = '';
          return m;
        })];
        this.isedit_stock = true;
        break;
      case 'document_ref':
        this.old_document_ref = this.currentQuotationData.document_reference;
        this.isedit_ref = true;
        break;
      // case 'illustration':
      //   this.old_illustration = this.currentQuotationData.illustration;
      //   this.isedit_illus = true;
      //   break;
      case 'remark':
        this.old_stocks = this.currentQuotationData.remark;
        this.isedit_remark = true;
        break;
    }
  }

  unitChange(stock, event) {
    // console.log("oldvalue", oldvalue);
    // //product_unit
    // console.log("newvalue", event.value);
    // //const a = math.unit(45, 'cm') ;

    // console.log("a", a);
    // const f = a.toNumber(UnitEng[event.value]) //a.to(UnitEng[event.value]);
    // console.log("f", f);
    let filterstocks = this.currentQuotationData.stocks.filter(f => f._id == stock._id);
    if (filterstocks.length > 0) {
      const filterstock = filterstocks[0];
      filterstock.products = this.filterProduct(stock._id);
      filterstock.products.forEach(f => {
        if (f.width) {
          const oldw = math.unit(f.width_m, UnitEng['เมตร']);
          f.width = parseFloat(oldw.toNumber(UnitEng[event.value]).toFixed(3));
        }
        if (f.height) {
          const oldh = math.unit(f.height_m, UnitEng['เมตร']);
          f.height = parseFloat(oldh.toNumber(UnitEng[event.value]).toFixed(3));
        }
      });

      filterstock.product_unit = event.value;

      //console.log("filterstock", filterstock);
      this.dlgloading = true;
      this.dlgerror = "";
      //console.log(img);

      this.is_saving = true;
      let shareData: any = {};

      //console.log("shareData", shareData);
      let service = this.quotationService.update(
        this.paramId,
        {
          quotation: Object.assign(shareData, {
            modifiedby: this.currentUser.fullname,
            modified_role : this.currentUser.display_role
          }),
          stocks: [filterstock],
          deleteStocks: [],
          deleteProducts: [],
        }

      );
      service.subscribe(
        (data: any) => {
          this.fetchQuotationData();
          this.is_saving = false;
        },
        (error: any) => {
          console.log("error", error);
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

  }

  locationChange() {
    this.dlgloading = true;
    this.dlgerror = "";
    //console.log(img);

    this.is_saving = true;
    let shareData: any = {};

    //console.log("shareData", shareData);
    let service = this.quotationService.update(
      this.paramId,
      {
        quotation: Object.assign(shareData, {
          modifiedby: this.currentUser.fullname,
          modified_role : this.currentUser.display_role
        }),
        stocks: this.currentQuotationData.stocks,
        deleteStocks: [],
        deleteProducts: [],
      }

    );
    service.subscribe(
      (data: any) => {
        this.fetchQuotationData();
        this.is_saving = false;
      },
      (error: any) => {
        console.log("error", error);
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

  checkEmptyRemark() : boolean{
    return this.cancelRemark == '' || typeof this.cancelRemark == undefined || this.cancelRemark == null;
  }

  onCancel(type) {
    switch (type) {
      case 'stock':
        console.log("this.old_stocks", this.old_stocks);
        this.currentQuotationData.stocks = [...this.old_stocks];
        this.isedit_stock = false;
        break;
      case 'document_ref':
        this.currentQuotationData.document_reference = this.old_document_ref;
        this.isedit_ref = false;
        break;
      // case 'illustration':
      //   this.currentQuotationData.illustration = this.old_illustration;
      //   this.isedit_illus = false;
      //   break;
      case 'remark':
        this.currentQuotationData.remark = this.old_stocks;
        this.isedit_remark = false;
        break;
      case "status":
        this.is_cancelled = true;
        this.onSaveData('status', this.jstatus.cancel);
        break;
    }
  }

  onSaveData(type, statusData?, extraObj?) {
    this.dlgloading = true;
    this.dlgerror = "";
    //console.log(img);

    this.is_saving = true;
    let shareData: any = extraObj ? extraObj : {};



    switch (type) {
      case 'document_ref':
        shareData['document_reference'] = this.currentQuotationData.document_reference;
        break;
      // case 'illustration':
      //   shareData['illustration'] = this.currentQuotationData.illustration;
      //   break;
      case 'remark':
        shareData['remark'] = this.currentQuotationData.remark;
        break;
      case 'status':
        shareData['status'] = statusData;
        if(statusData == this.jstatus.cancel){
          shareData["cancel_remark"] = this.cancelRemark;
        }
        break;
    }

    console.log("shareData", shareData);
    let service = this.quotationService.update(
      this.paramId,
      {
        quotation: Object.assign(shareData, {
          modifiedby: this.currentUser.fullname,
          modified_role : this.currentUser.display_role
        }),
        stocks: [],
        deleteStocks: [],
        deleteProducts: [],
      }

    );
    service.subscribe(
      (data: any) => {
        this.fetchQuotationData();
        this.is_saving = false;
        switch (type) {
          case 'document_ref':
            this.isedit_ref = false;
            break;
          // case 'illustration':
          //   this.isedit_illus = false;
          //   break;
          case 'remark':
            this.isedit_remark = false;
            break;
          case 'status':
            this.declineConfirm();
            this.decline();
            break;
        }
      },
      (error: any) => {
        console.log("error", error);
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


  onDeleteQuotation() {
    this.dlgloading = true;
    this.deleteResult = true;
    this.dlgerror = "";
    this.quotationService.delete(this.paramId).subscribe(
      (data: any) => {
        this.declineConfirm();
        this.decline();
        setTimeout(() => {
          this.router.navigate([`/${this.routepath.order}`]);
        }, 200);
      },
      (error: any) => {
        this.dlgerror = error.message;
        this.dlgloading = false;
        this.changeDetectorRef.detectChanges();
      }
    );
  }

  onSearchAttachmentClick(ispush = false) {
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
    this.fetchAttachmentData(serach);
  }

  onClickNewTab(url) {
    window.open(url);
  }

  fetchAttachmentData(search) {
    this.dataSourceLoading = true;
    this.quotationAttachmentService.findBy(search).subscribe((d: any) => {
      //this.dataSourceCount = d.count;

      this.dataSourceAttach = d.results.map((d) => {
        const cursenddate = moment(d.created).tz(this.shareService.tz);
        d.created = cursenddate.format("D/M/YYYY");
        return d;
      });
      this.changeDetectorRef.detectChanges();
    });
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

  onSaveDataAttach() {
    this.dlgloading = true;
    this.dlgerror = "";
    //console.log(img);
    let filternewfile = this.files.filter((file: UploadImage) => {
      return file.id === "0";
    });
    let filename = '';
    if (filternewfile.length > 0) {
      filename = filternewfile[0].name;
    }
    this.uploadDocuments((imgs) => {

      let shareData: any = {
        document_name: filename,
        quotation_id: this.paramId,
      };

      if (imgs !== null) {
        let imagearr = [];
        Object.keys(imgs).forEach((m) => {
          imagearr.push(imgs[m]);
        });
        shareData.document = imagearr.join("");
      }

      let service = this.quotationAttachmentService.add(
        Object.assign(shareData, {
          createdby: this.currentUser.fullname
        })
      );
      let isnew = true;
      if (this.f._id.value && this.f._id.value !== "") {
        isnew = false;
        service = this.quotationAttachmentService.update(
          this.f._id.value,
          Object.assign(shareData, {
            modifiedby: this.currentUser.fullname
          })
        );
      }

      service.subscribe(
        (data: any) => {
          this.decline();
          this.onSearchAttachmentClick();
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

  onDeleteAttach() {
    this.dlgloading = true;
    this.deleteResult = true;
    this.dlgerror = "";
    this.quotationAttachmentService.delete(this.deleteElement._id).subscribe(
      (data: any) => {
        this.onSearchAttachmentClick();
        this.decline();
      },
      (error: any) => {
        this.dlgerror = error.message;
        this.dlgloading = false;
        this.changeDetectorRef.detectChanges();
      }
    );
  }

  exportAsPDF(isdownload, cb?) {

    let extraObj: any = {};

    if (!this.currentQuotationData.onprogress_date) {
      console.log("save onprogress_date");
      extraObj.onprogress_date = this.shareService.getToDBDate(moment())
    }
    this.onSaveData('status', this.jstatus.prcessing, extraObj);
    this.showLoading();
    let self = this;
    setTimeout(() => {
      html2canvas(document.getElementById("topdf"), {
        allowTaint: true,
        useCORS: true,
        scale: 2,
      }).then(function (canvas) {
        var img = canvas.toDataURL("image/png");
        var doc = new jsPDF("p", "pt", "a4");
        var pageCount = self.printProducts.length;
        // console.log("canvas.width ", canvas.width);
        // console.log("canvas.height ", canvas.height);

        var width = doc.internal.pageSize.getWidth();
        var height = doc.internal.pageSize.getHeight();
        var ratio = width / canvas.width;
        // console.log("width", width);
        // console.log("ratio", ratio);
        //console.log("height", height);

        doc.setProperties({
          title: "ใบสั่งผลิต",
        });
        doc.addImage(img, "PNG", 0, 0, width, canvas.height * ratio);
        for (var i = 1; i < pageCount; i++) {
          doc.addPage();
          doc.addImage(img, "PNG", 0, -(height * i), width, canvas.height * ratio, undefined, 'FAST');
        }
        if (cb) {
          // console.log("dataurl");
          // var datauristring = doc.output("datauristring");
          // console.log("dataurl", datauristring);
          cb();
        } else {
          if (isdownload) {
            doc.save(`${self.currentQuotationData.quotation_code} - ${self.currentCustomerData.customer_name}.pdf`);
          } else {
            window.open(doc.output("bloburl").toString(), "_blank");
          }
        }
        self.hideLoading();
        //doc.save("GoUni-Quotation");
      });
    }, 200)

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
    this.dataFormAttach = this.fb.group({
      _id: [""],
      document: [""],
    });
    this.dlgloading = false;
    this.modalRef.hide();
  }

  openModalConfirm(template: TemplateRef<any>, element?: any, cb?) {
    this.modalRef2 = this.modalService.show(template, {
      class: "modal-md modal-adj",
    });
    if (cb) { cb(); }
  }

  declineConfirm(): void {
    this.modalRef2.hide();
    this.cancelRemark = null;
  }

  showLoading() {
    document.getElementById('showModalLoading')!.click();
  }
  hideLoading() {
    document.getElementById('hideModalLoading')!.click();
  }

  get isUser() {
    return this.currentUser && this.currentUser.role === Role.User;
  }
  get isAdmin() {
    return this.currentUser && this.currentUser.role === Role.Admin;
  }
  get isSuperAdmin() {
    return this.currentUser && this.currentUser.role === Role.SuperAdmin;
  }
}
