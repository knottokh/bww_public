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
import {
  RouterPath,
  User,
  UnitEng,
  POStatus,
  QStockType,
  UploadImage,
  Role,
} from "src/app/_models";
import {
  AuthenticationService,
  SellerService,
  ShippingService,
  PaymentService,
  QuotationService,
  ShareService,
  UploadService,
  QuotationAttachmentService,
} from "src/app/_services";
import { forkJoin } from "rxjs";
import { ImagegridService } from "src/app/_services/imagegrid.service";
import * as _moment from "moment-timezone";
import * as math from "mathjs";
const moment = _moment;

@Component({
  selector: 'app-purchase-detail',
  templateUrl: './purchase-detail.component.html',
  styleUrls: ['./purchase-detail.component.scss']
})
export class PurchaseDetailComponent implements OnInit {
  moment: any = moment;
  modalRef: BsModalRef;
  modalRef2: BsModalRef;

  quillStyle = {
    height: "100px",
  };
  quillviewStyle = {
    border: "0px",
  };
  quillConfig = {
    modules: {
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          ["link", "image", "video"],
        ],
        handlers: {
          image: function (image) {
            //console.log('image', image);
            if (image) {
              const input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", "image/*");
              input.click();
              input.onchange = function () {
                const file = input.files[0];
                //console.log('User trying to uplaod this:', file);

                const reader = new FileReader();
                const range = this.quill.getSelection();
                const self = this;
                reader.addEventListener(
                  "load",
                  function () {
                    // convert image file to base64 string
                    //console.log("self.quill.", self.quill);
                    // self.quill.insertEmbed(range.index, 'image', reader.result);
                    self.quill.pasteHTML(
                      range.index,
                      `<img class="c-img-100" src="${reader.result}"/>`
                    );
                    //self.quill.insertEmbed(range, 'block', '<p><br></p>');
                    //self.quill.insertEmbed(range.index + 1, "break", true);
                    //self.quill.insertEmbed(range.index, 'br');
                  },
                  false
                );

                if (file) {
                  reader.readAsDataURL(file);
                }

                //const id = await uploadFile(file); // I'm using react, so whatever upload function

                //const link = `${ROOT_URL}/file/${id}`;

                // this part the image is inserted
                // by 'image' option below, you just have to put src(link) of img here.
              }.bind(this);
            }
          },
        },
      },
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
    theme: "snow", // or 'bubble'
  };

  dataFormSeller: FormGroup;
  dataFormAttach: FormGroup;

  routepath: any;
  paramId: string;

  displayedColumns = ["title", "quantity", "unit", "price", "total_price"];
  dataSource: any = [];

  postatus: any = POStatus;

  currentUser: User;

  dlgloading = false;
  dlgerror = "";
  dlgmsgok = "";

  loading = false;
  error = "";
  msgok = "";

  deleteResult = false;

  approveElement: any = null;
  approveResult = false;

  editSellerResult = false;

  allactionResult = false;

  sorting = { modified: -1 };
  startRow = 0;
  pageSize = 20;
  dataSourceCount = 0;
  dataSourceLoading = false;
  currentPage = 1;

  currentSellerData: any = {};

  is_saving: boolean = false;
  isedit_stock: boolean = false;
  isedit_ref: boolean = false;
  isedit_illus: boolean = false;
  isedit_remark: boolean = false;
  isedit_customer: boolean = false;
  is_cancelled: boolean = false;

  cancelRemark: any = null;

  old_document_ref: string = "";
  old_illustration: string = "";
  old_remark: string = "";
  old_stocks: any = [];

  files: any = [];
  progress: any;
  messages: any;

  deleteElement: any = null;
  displayedAttachColumns = ["document_name", "action"];
  dataSourceAttach: any = [];

  documenttype = "";
  searchtext = "";

  stockType = QStockType;

  sumQuotation = "0";
  vat = "0";
  sumQuotationIncVat = "0";
  totalQuotation = "0";

  printStock: any = {};
  printProducts: any = [];

  printPages: any = [];
  printDocuments: any = [];
  printImages: any = [];

  payment_type_datas: any = [];
  // shipping_type_datas: any = [];

  payment_type_default: string = "";
  // shipping_type_default: string = "";

  message_confirm: string = "";
  action_confirm: string = "";

  constructor(
    private authenticationService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService,
    public route: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder,
    private sellerService: SellerService,
    private shippingService: ShippingService,
    private paymentService: PaymentService,
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
      // this.customerId = params.withCustomerId;
      this.paramId = params.withId;
    });
    this.dataFormAttach = this.fb.group({
      _id: [""],
      document: [""],
    });
    this.dataFormSeller = this.fb.group({
      seller_name: ["", Validators.required],
      seller_dealer: [""],
      seller_phone: ["", Validators.required],
      seller_email: [""],
      seller_line: [""],
      seller_type: ["VAT", Validators.required],
      seller_payment_type: ["", Validators.required],
      seller_payment_remark: [""],
    });
  }

  ngOnInit(): void {
    // this.fetchCustomerData();
    this.fetchQuotationData();
    this.onSearchAttachmentClick();
  }

  get f() {
    return this.dataFormAttach.controls;
  }

  get fs() {
    return this.dataFormSeller.controls;
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

  fetchSellerData(customerId: string) {
    if (customerId && customerId != '') {
      this.sellerService.getById(customerId).subscribe((data: any) => {
        // console.log("customer data: ", data);
        // case quotation didn't have customer data before.
        if (this.dataSource.seller_type === undefined) {
          this.fs.seller_name.setValue(data.seller_name);
          this.fs.seller_dealer.setValue(data.seller_dealer);
          this.fs.seller_phone.setValue(data.seller_phone);
          this.fs.seller_email.setValue(data.seller_email);
          this.fs.seller_line.setValue(data.seller_line);
          this.fs.seller_type.setValue(data.seller_type || "VAT");
          this.fs.seller_payment_type.setValue(
            data.seller_payment_type || this.payment_type_default
          );
          this.fs.seller_payment_remark.setValue(data.seller_payment_remark);
        } else {
          // case quotation already have customer data
          //seller_id
          this.fs.seller_name.setValue(this.dataSource.seller_name);
          this.fs.seller_dealer.setValue(this.dataSource.seller_dealer);
          this.fs.seller_phone.setValue(this.dataSource.seller_phone);
          this.fs.seller_email.setValue(this.dataSource.seller_email);
          this.fs.seller_line.setValue(this.dataSource.seller_line);
          this.fs.seller_type.setValue(this.dataSource.seller_type || "VAT");
          this.fs.seller_payment_type.setValue(
            this.dataSource.seller_payment_type || this.payment_type_default
          );
          this.fs.seller_payment_remark.setValue(this.dataSource.seller_payment_remark);
        }

        this.currentSellerData = data;
        this.changeDetectorRef.detectChanges();
      });
    } else {
      this.fs.seller_name.setValue(this.dataSource.seller_name);
      this.fs.seller_dealer.setValue(this.dataSource.seller_dealer);
      this.fs.seller_phone.setValue(this.dataSource.seller_phone);
      this.fs.seller_email.setValue(this.dataSource.seller_email);
      this.fs.seller_line.setValue(this.dataSource.seller_line);
      this.fs.seller_type.setValue(this.dataSource.seller_type || "VAT");
      this.fs.seller_payment_type.setValue(
        this.dataSource.seller_payment_type || this.payment_type_default
      );
      this.fs.seller_payment_remark.setValue(this.dataSource.seller_payment_remark);
    }
  }

  // fetchShippingData() {
  //   this.shippingService
  //     .findBy({
  //       sort: { sequence: 1 },
  //       filter: {},
  //     })
  //     .subscribe((d: any) => {
  //       this.shipping_type_datas = d.results;
  //       if (
  //         this.shipping_type_datas.length > 0 &&
  //         !this.fs.shipping_type.value
  //       ) {
  //         this.fs.shipping_type.setValue(this.shipping_type_datas[0].title);
  //       }
  //       if (this.shipping_type_datas.length > 0) {
  //         this.shipping_type_default = this.shipping_type_datas[0].title;
  //       }
  //       this.changeDetectorRef.detectChanges();
  //     });
  // }

  fetchPaymentData() {
    this.paymentService
      .findBy({
        sort: { sequence: 1 },
        filter: {},
      })
      .subscribe((d: any) => {
        this.payment_type_datas = d.results;
        if (this.payment_type_datas.length > 0 && !this.fs.seller_payment_type.value) {
          this.fs.seller_payment_type.setValue(this.payment_type_datas[0].title);
        }
        if (this.payment_type_datas.length > 0) {
          this.payment_type_default = this.payment_type_datas[0].title;
        }
        this.changeDetectorRef.detectChanges();
      });
  }

  onPageChange(event) {
    // console.log(event);
    this.currentPage = event;
    this.startRow = (this.currentPage - 1) * this.pageSize;
    this.onSearchClick();
  }

  resetClick() {
    this.documenttype = "customer_code";
    this.searchtext = "";
  }

  onSearchClick(ispush = false) {
    const searcharr = [];

    searcharr.push({ $eq: ["$customer_id", this.paramId] });

    if (this.documenttype) {
      searcharr.push({ $eq: ["$document_type", this.documenttype] });
    }

    if (this.searchtext) {
      searcharr.push({
        $regexMatch: {
          input: { $toLower: `$quotation_code` },
          regex: `.*${this.searchtext.toLowerCase()}.*`,
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
    this.fetchQuotationData();
  }

  // fetchQuotationData(search) {
  //   this.dataSourceLoading = true;
  //   this.quotationService.findBy(search).subscribe((d: any) => {
  //     this.dataSourceCount = d.count;

  //     this.dataSource = d.results.map((d) => {
  //       const cursenddate = moment(d.created).tz(this.shareService.tz);
  //       d.created = cursenddate.format("D/M/YYYY");
  //       return d;
  //     });
  //     this.changeDetectorRef.detectChanges();
  //   });
  // }

  fetchQuotationData() {
    this.printDocuments = [];
    if (this.paramId && this.paramId !== "" && this.paramId !== "new") {
      this.dataSourceLoading = true;
      this.quotationService.getById(this.paramId).subscribe((data: any) => {
        //console.log("quotation data", data);
        let getQuotation = {
          _id: data._id,
          quotation_code: data.quotation_code,
          seller_name: data.seller_name,
          seller_dealer: data.seller_dealer,
          seller_email: data.seller_email,
          seller_line: data.seller_line,
          seller_type: data.seller_type,
          seller_payment_remark: data.seller_payment_remark,
          seller_payment_type: data.seller_payment_type,
          seller_phone: data.seller_phone,
          seller_remark: data.seller_remark,
          remark: data.remark,
          status: data.status,
          document_type: data.document_type,
          document_reference: data.document_reference,
          illustration: data.illustration,
          customer_id: data.customer_id,
          seller_id: data.seller_id,
          created: data.created,
          modified: data.modified,
          approved: data.approved,
          createdby: data.createdby,
          modifiedby: data.modifiedby,
          approvedby: data.approvedby,
          created_role: data.created_role,
          modified_role: data.modified_role,
          approved_role: data.approved_role,
          cancel_remark: data.cancel_remark,
          stocks: data.stocks.map((stock) => {
            let findProduct = data.products.filter(
              (p) => stock._id === p.quotation_stock_id
            );
            stock.products = [];
            if (findProduct !== undefined) {
              findProduct.map((f) => {
                stock.products.push(f);
              });
            }

            return stock;
          }),
          ref_quotation: data.ref_quotation,
          ref_quotation_ids: data.ref_quotation_ids,
          //child_quotations: data.child_quotations,
        };

        if (data.status == this.postatus.cancel) {
          this.is_cancelled = true;
        }

        // console.log("getQuotation", getQuotation);
        this.dataSourceCount = data.count;
        this.dataSource = getQuotation;

        //console.log(this.dataSource);
        if (this.dataSource.stocks.length > 0) {
          this.calculate(this.dataSource.stocks);

          if (this.dataSource.stocks.length > 0) {
            let items: any = [];
            let currentIndex = 1;
            let printIndex = 1;
            this.dataSource.stocks.map((stock) => {
              // console.log("stock map");
              // stock
              if (currentIndex % 15 == 0) {
                if (stock.stock_type == this.stockType.order) {
                  if (items.length > 0) {
                    this.printDocuments.push({
                      type: "document",
                      items: items,
                    });
                    items = [];
                    items.push({
                      ...stock,
                      printIndex: printIndex.toString(),
                    });

                    currentIndex += 2;
                  }
                } else {
                  items.push({
                    ...stock,
                    printIndex: printIndex.toString(),
                  });

                  this.printDocuments.push({ type: "document", items: items });
                  items = [];
                  currentIndex++;
                }
              } else {
                items.push({
                  ...stock,
                  printIndex: printIndex.toString(),
                });

                currentIndex++;
              }

              // product
              if (stock.products.length > 0) {
                stock.products.forEach((p: any, inx: number) => {
                  if (currentIndex % 15 == 0) {
                    if (inx == stock.products.length - 1) {
                      if (items.length > 0) {
                        items.push({
                          printIndex: `• ${printIndex}.${inx + 1}`,
                          title: `ขนาด ${p.width} x ${p.height
                            } ${stock.product_unit}`,
                          ...p,
                        });
                      }
                      this.printDocuments.push({
                        type: "document",
                        items: items,
                      });
                      items = [];
                      currentIndex++;
                    } else {
                      // push current product
                      if (items.length > 0) {
                        items.push({
                          printIndex: `• ${printIndex}.${inx + 1}`,
                          title: `ขนาด ${p.width} x ${p.height
                            } ${stock.product_unit}`,
                          ...p,
                        });
                      }
                      this.printDocuments.push({
                        type: "document",
                        items: items,
                      });
                      items = [];
                      // push stock
                      items.push({
                        ...stock,
                        printIndex: printIndex.toString(),
                      });
                      currentIndex += 2;
                    }
                  } else {
                    // case normal
                    items.push({
                      printIndex: `• ${printIndex}.${inx + 1}`,
                      title: `ขนาด ${p.width} x ${p.height
                        } ${stock.product_unit}`,
                      ...p,
                    });
                    currentIndex++;
                  }
                });
              }

              if (
                items.length > 0 &&
                printIndex == this.dataSource.stocks.length
              ) {
                this.printDocuments.push({ type: "document", items: items });
              }

              printIndex++;
            });
            // this.printStock = this.dataSource.stocks[0];
            // let products: any = [];
            // let memboerProducts: any = [];
            // this.dataSource.products.forEach((p: any, inx: number) => {
            //   if (inx % 10 == 0) {
            //     if (memboerProducts.length > 0) {
            //       products.push(memboerProducts);
            //     }
            //     memboerProducts = [];
            //   }
            //   memboerProducts.push(p);
            //   if (inx == this.dataSource.products.length - 1) {
            //     products.push(memboerProducts);
            //   }
            // });
            // this.printProducts = products;
            // console.log("this.printProducts", this.printProducts);
          }
        }
        this.changeDetectorRef.detectChanges();
        //this.fetchShippingData();
        this.fetchPaymentData();
        this.fetchSellerData('');
      });
    }
  }

  // onApprove() {
  //   this.dataSource.status = this.postatus.approved;
  //   this.dataSource.approved = Date.now();
  //   this.dataSource.approvedby = this.currentUser.username;
  //   this.loading = true;
  //   this.approveResult = true;
  //   // console.log("update status", this.dataSource);
  //   let service = this.quotationService.updateStatusApprove(
  //     this.paramId,
  //     this.dataSource
  //   );

  //   service.subscribe(
  //     (data: any) => {
  //       // console.log("data return from approve", data);
  //       this.msgok = data.message;
  //       this.loading = false;
  //       this.approveResult = false;
  //       this.decline();
  //       // console.log("this.routepath.order", this.routepath.order);
  //       this.router.navigate([`/${this.routepath.order}`]);
  //       this.changeDetectorRef.detectChanges();
  //     },
  //     (error: any) => {
  //       console.log("erorr", error);
  //       this.error = error.message;
  //       this.loading = false;
  //       this.approveResult = false;
  //       this.changeDetectorRef.detectChanges();
  //       setTimeout(() => {
  //         this.error = "";
  //         this.changeDetectorRef.detectChanges();
  //       }, 5000);
  //     }
  //   );
  // }

  onEditSellerData() {
    let editQuotation = {
      seller_name: this.fs.seller_name.value,
      seller_dealer: this.fs.seller_dealer.value,
      seller_phone: this.fs.seller_phone.value,
      seller_email: this.fs.seller_email.value,
      seller_line: this.fs.seller_line.value,
      seller_type: this.fs.seller_type.value,
      seller_payment_type: this.fs.seller_payment_type.value,
      seller_payment_remark: this.fs.seller_payment_remark.value,
      modified: Date.now(),
      modifiedby: this.currentUser.username,
      modified_role: this.currentUser.display_role
    };

    this.loading = true;
    this.editSellerResult = true;

    let service = this.quotationService.update(this.paramId, {
      quotation: editQuotation,
      stocks: [],
      deleteStocks: [],
      deleteProducts: [],
    });

    service.subscribe(
      (data: any) => {
        // update datasource customer info
        this.dataSource.seller_name = this.fs.seller_name.value;
        this.dataSource.seller_dealer = this.fs.seller_dealer.value;
        this.dataSource.seller_phone = this.fs.seller_phone.value;
        this.dataSource.seller_email = this.fs.seller_email.value;
        this.dataSource.seller_line = this.fs.seller_line.value;
        this.dataSource.seller_type = this.fs.seller_type.value;
        this.dataSource.seller_payment_type = this.fs.seller_payment_type.value;
        this.dataSource.seller_payment_remark = this.fs.seller_payment_remark.value;
        this.dataSource.modified = Date.now();
        this.dataSource.modifiedby = this.currentUser.username;
        this.dataSource.modified_role = this.currentUser.display_role;

        this.msgok = data.message;
        this.loading = false;
        this.editSellerResult = false;
        this.decline();
        this.changeDetectorRef.detectChanges();
      },
      (error: any) => {
        console.log("erorr", error);
        this.error = error.message;
        this.loading = false;
        this.approveResult = false;
        this.changeDetectorRef.detectChanges();
        setTimeout(() => {
          this.error = "";
          this.changeDetectorRef.detectChanges();
        }, 5000);
      }
    );
  }

  onActionSubmit() {
    switch (this.action_confirm) {
      case "request-approve":
      case "request-approve-agian":
        this.onSaveData("status", this.postatus.waiting_approval);
        break;
      case "cancel-request":
        this.onSaveData("status", this.postatus.pending);
        break;
      case "approved":
        //
        this.onSaveData("status", this.postatus.approved);
        break;
      case "rejected":
        this.onSaveData("status", this.postatus.rejected);
        break;
      // case "waiting_product":
      //   this.onSaveData("status", this.postatus.waiting_product);
      //   break;
      case "received":
        this.onSaveData("status", this.postatus.received);
        break;
      case "cancelled":
        this.is_cancelled = true;
        this.onSaveData("status", this.postatus.cancel);
        break;
      case "remove":
        this.onDeleteQuotation();
        break;
      case "duplicate":
        this.onDuplicate();
        break;

    }
  }

  checkEmptyRemark(): boolean {
    return this.cancelRemark == '' || typeof this.cancelRemark == undefined || this.cancelRemark == null;
  }

  onCancelQuotaion() {
    this.is_cancelled = true;
    this.onSaveData("status", this.postatus.cancel);
  }

  onDuplicate() {
    // console.log(this.dataSource);
    // this.dataSource.status = "อนุมัติแล้ว";
    // this.dataSource.modified = Date.now();
    // this.dataSource.modifiedby = this.currentUser.username;
    this.loading = true;
    this.allactionResult = true;
    this.dataSource.stocks.forEach(element => {
      element.from_quotation = false;
    });
    let duplicateQuotaton = {
      ...this.dataSource,
      _id: "0",
      quotation_code: "0",
      status: this.postatus.pending,
      document_type: "po",
      created: Date.now(),
      modified: Date.now(),
      createdby: this.currentUser.fullname,
      created_role: this.currentUser.display_role,
      modifiedby: this.currentUser.username,
      modified_role: this.currentUser.display_role,
      approved:  "",
      approvedby:  "",
      approved_role: "",
    };
    // console.log("dup quotation", duplicateQuotaton);

    let service = this.quotationService.add(duplicateQuotaton);

    service.subscribe(
      (data: any) => {
        // console.log("data return from dup", data);
        this.msgok = data.message;
        this.loading = false;
        this.allactionResult = false;
        this.declineConfirm();
        this.decline();
        // this.router.navigate([
        //   `/${this.routepath.quotation}/${data.result._id}/view`,
        // ]);
        this.changeDetectorRef.detectChanges();
        setTimeout(() => {
          this.router.navigate([`/${this.routepath.purchase}`]);
        }, 200);
      },
      (error: any) => {
        this.error = error.message;
        this.loading = false;
        this.allactionResult = false;
        this.changeDetectorRef.detectChanges();
        setTimeout(() => {
          this.error = "";
          this.changeDetectorRef.detectChanges();
        }, 5000);
      }
    );
  }

  onEdit(type) {
    switch (type) {
      case "document_ref":
        this.old_document_ref = this.dataSource.document_reference;
        this.isedit_ref = true;
        break;
      case "illustration":
        this.old_illustration = this.dataSource.illustration;
        this.isedit_illus = true;
        break;
      case "remark":
        this.old_stocks = this.dataSource.remark;
        this.isedit_remark = true;
        break;
    }
  }

  onCancel(type) {
    switch (type) {
      case "document_ref":
        this.dataSource.document_reference = this.old_document_ref;
        this.isedit_ref = false;
        break;
      case "illustration":
        this.dataSource.illustration = this.old_illustration;
        this.isedit_illus = false;
        break;
      case "remark":
        this.dataSource.remark = this.old_stocks;
        this.isedit_remark = false;
        break;
      case "status":
        this.is_cancelled = true;
        this.onSaveData("status", this.postatus.cancel);
        break;
    }
  }

  onSaveData(type, statusData?) {
    this.dlgloading = true;
    this.dlgerror = "";
    //console.log(img);

    this.is_saving = true;
    let shareData: any = {};

    switch (type) {
      case "document_ref":
        shareData["document_reference"] = this.dataSource.document_reference;
        break;
      case "illustration":
        shareData["illustration"] = this.dataSource.illustration;
        break;
      case "remark":
        shareData["remark"] = this.dataSource.remark;
        break;
      case "status":
        shareData["status"] = statusData;
        if (statusData == this.postatus.approved) {
          shareData["approved"] = Date.now();
          shareData["approvedby"] = this.currentUser.fullname;
          shareData["approved_role"] = this.currentUser.display_role;
        } else if (statusData == this.postatus.cancel) {
          shareData["cancel_remark"] = this.cancelRemark;
        }
        break;
    }
    // console.log("shareData", shareData);
    let service = this.quotationService.update(this.paramId, {
      quotation: Object.assign(shareData, {
        modifiedby: this.currentUser.fullname,
        modified_role: this.currentUser.display_role
      }),
      stocks: [],
      deleteStocks: [],
      deleteProducts: [],
    });
    service.subscribe(
      (data: any) => {
        this.fetchQuotationData();
        this.is_saving = false;
        switch (type) {
          case "document_ref":
            this.isedit_ref = false;
            break;
          case "illustration":
            this.isedit_illus = false;
            break;
          case "remark":
            this.isedit_remark = false;
            break;
          case "status":
            this.declineConfirm();
            this.decline();
            break;
        }
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

  calculate(stocks) {
    let sum = 0;
    stocks.map((stock) => {
      if (stock.stock_type == QStockType.order) {
        stock.products.map((product) => {
          sum += product.price * product.quantity;
        });
      } else {
        sum += stock.price * stock.quantity;
      }
    });
    this.sumQuotation = sum.toFixed(2);
    this.vat = (sum * 0.07).toFixed(2);
    this.sumQuotationIncVat = (sum * 0.93).toFixed(2);
    this.totalQuotation = (sum + sum * 0.07).toFixed(2);
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
    this.printImages = [];
    this.dataSourceLoading = true;
    this.quotationAttachmentService.findBy(search).subscribe((d: any) => {
      //this.dataSourceCount = d.count;

      this.dataSourceAttach = d.results.map((d) => {
        const cursenddate = moment(d.created).tz(this.shareService.tz);
        d.created = cursenddate.format("D/M/YYYY");
        return d;
      });
      // console.log("this attach", this.dataSourceAttach);
      let imageList = this.dataSourceAttach.filter(
        (a) =>
          a.document.contentType == "image/jpeg" ||
          a.document.contentType == "image/jpg" ||
          a.document.contentType == "image/png"
      );
      // console.log("imageList", imageList);
      // image
      if (imageList.length > 0) {
        let imageSet: any = [];
        imageList.forEach((illust: any, inx: number) => {
          // console.log("illust", illust);
          if (inx % 4 == 0) {
            if (imageSet.length > 0) {
              this.printImages.push({ type: "image", imageSet: imageSet });
            }
            imageSet = [];
          }
          imageSet.push(illust);
          if (inx == imageList.length - 1) {
            this.printImages.push({ type: "image", imageSet: imageSet });
          }
        });
      }

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
    let filename = "";
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
          createdby: this.currentUser.fullname,
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
    this.showLoading();
    let self = this;
    if (this.dataSource.status == "อนุมัติแล้ว") this.onSaveData("status", this.postatus.waiting_product);
    setTimeout(() => {
      html2canvas(document.getElementById("topdf"), {
        allowTaint: true,
        useCORS: true,
        scale: 2,
      }).then(function (canvas) {
        var img = canvas.toDataURL("image/png");
        var doc = new jsPDF("p", "pt", "a4");
        var pageCount = self.printDocuments.length + self.printImages.length;

        // var ratio = canvas.width / canvas.height;
        // var width = doc.internal.pageSize.getWidth();
        // var height = width / ratio;

        var width = doc.internal.pageSize.getWidth();
        var height = doc.internal.pageSize.getHeight();
        var ratio = width / canvas.width;

        doc.setProperties({
          title: "Bww - Purchase",
        });
        doc.addImage(
          img,
          "PNG",
          0,
          0,
          width,
          canvas.height * ratio,
          undefined,
          "FAST"
        );
        for (var i = 1; i < pageCount; i++) {
          doc.addPage();
          doc.addImage(
            img,
            "PNG",
            0,
            -(height * i),
            width,
            canvas.height * ratio,
            undefined,
            "FAST"
          );
        }
        if (cb) {
          // console.log("dataurl");
          // var datauristring = doc.output("datauristring");
          // console.log("dataurl", datauristring);
          cb();
        } else {
          if (isdownload) {
            doc.save(
              `${self.dataSource.quotation_code} - ${self.dataSource.seller_name}.pdf`
            );
          } else {
            window.open(doc.output("bloburl").toString(), "_blank");
          }
        }
        self.hideLoading();
        //doc.save("GoUni-Quotation");
      });
    }, 200);
  }

  onDeleteQuotation() {
    this.dlgloading = true;
    this.allactionResult = true;
    this.dlgerror = "";
    this.quotationService.delete(this.paramId).subscribe(
      (data: any) => {
        this.declineConfirm();
        this.decline();
        setTimeout(() => {
          this.router.navigate([`/${this.routepath.purchase}`]);
        }, 200);
      },
      (error: any) => {
        this.dlgerror = error.message;
        this.dlgloading = false;
        this.changeDetectorRef.detectChanges();
      }
    );
  }

  openModal(template: TemplateRef<any>, element?: any) {
    if (this.modalRef !== undefined) this.modalRef.hide();
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

  onGoTo(direction): void {
    switch (direction) {
      case "purchase": {
        this.router.navigate([
          `/${this.routepath.purchase}/${this.currentSellerData._id}/${this.paramId}`,
        ]);
        break;
      }
      // case "seller": {
      //   this.router.navigate([
      //     `/${this.routepath.seller}/${this.currentSellerData._id}`,
      //   ]);
      //   break;
      //}
    }

    this.dlgloading = false;
    this.modalRef.hide();
  }

  showLoading() {
    document.getElementById("showModalLoading")!.click();
  }
  hideLoading() {
    document.getElementById("hideModalLoading")!.click();
  }
  openModalConfirm(template: TemplateRef<any>, element?: any, cb?) {
    if (element) {
      this.message_confirm = element.message;
      this.action_confirm = element.action;
    }
    this.modalRef2 = this.modalService.show(template, {
      class: "modal-md modal-adj",
    });
    if (cb) {
      cb();
    }
  }

  declineConfirm(): void {
    this.modalRef2.hide();
    this.cancelRemark = null;
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
