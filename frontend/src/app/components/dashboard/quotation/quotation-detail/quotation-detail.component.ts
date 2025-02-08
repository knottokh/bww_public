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
  QStatus,
  QStockType,
  UploadImage,
  Role,
} from "src/app/_models";
import {
  AuthenticationService,
  CustomerService,
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
  selector: "app-quotation-detail",
  templateUrl: "./quotation-detail.component.html",
  styleUrls: ["./quotation-detail.component.scss"],
})
export class QuotationDetailComponent implements OnInit {
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

  dataFormCustomer: FormGroup;
  dataFormAttach: FormGroup;

  routepath: any;
  paramId: string;

  displayedColumns = ["title", "quantity", "unit", "price", "total_price"];
  dataSource: any = [];

  qstatus: any = QStatus;

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

  editCustomerResult = false;

  duplicateResult = false;

  cancelRemark: any = null;

  sorting = { modified: -1 };
  startRow = 0;
  pageSize = 20;
  dataSourceCount = 0;
  dataSourceLoading = false;
  currentPage = 1;

  currentCustomerData: any = {};

  is_saving: boolean = false;
  isedit_stock: boolean = false;
  isedit_ref: boolean = false;
  isedit_illus: boolean = false;
  isedit_remark: boolean = false;
  isedit_customer: boolean = false;
  is_cancelled: boolean = false;

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
  totalQuotation = "0";

  printStock: any = {};
  printProducts: any = [];

  printPages: any = [];
  printDocuments: any = [];
  printImages: any = [];

  payment_type_datas: any = [];
  shipping_type_datas: any = [];

  payment_type_default: string = "";
  shipping_type_default: string = "";

  constructor(
    private authenticationService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService,
    public route: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder,
    private customerService: CustomerService,
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
    this.dataFormCustomer = this.fb.group({
      customer_code: ["", Validators.required],
      customer_name: ["", Validators.required],
      dealer: [""],
      phone: ["", Validators.required],
      email: [""],
      line: [""],
      customer_type: ["VAT", Validators.required],
      payment_type: ["", Validators.required],
      payment_remark: [""],
      shipping_type: ["", Validators.required],
      shipping_detail: [""],
      tax_address: [""],
      tax_id: [""],
      note: [""],
      remark: [
        "<p>- ใบเสนอราคามีอายุ 14 วันนับจากวันที่เปิดใบเสนอราคา<p><p>- ราคาและรายละเอียดสินค้าให้ยึดตามรายละเอียดใบเสนอราคา<p>",
      ],
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

  get fc() {
    return this.dataFormCustomer.controls;
  }

  removeTags(str) {
    if (str === null || str === "") return false;
    else str = str.toString();

    // Regular expression to identify HTML tags in
    // the input string. Replacing the identified
    // HTML tag with a null string.
    return str.replace(/(<([^>]+)>)/gi, "");
  }

  getFileUrl(filename) {
    return this.imagegridService.getFileUrl(filename);
  }

  fetchCustomerData(customerId: string) {
    this.customerService.getById(customerId).subscribe((data: any) => {
      // console.log("customer data: ", data);
      // case quotation didn't have customer data before.
      if (this.dataSource.customer_type === undefined) {
        this.fc.customer_code.setValue(data.customer_code);
        this.fc.customer_name.setValue(data.customer_name);
        this.fc.dealer.setValue(data.dealer);
        this.fc.phone.setValue(data.phone);
        this.fc.email.setValue(data.email);
        this.fc.line.setValue(data.line);
        this.fc.customer_type.setValue(data.customer_type || "VAT");
        this.fc.payment_type.setValue(
          data.payment_type || this.payment_type_default
        );
        this.fc.payment_remark.setValue(data.payment_remark);
        this.fc.shipping_type.setValue(
          data.shipping_type || this.shipping_type_default
        );
        this.fc.shipping_detail.setValue(data.shipping_detail);
        this.fc.tax_address.setValue(data.tax_address);
        this.fc.tax_id.setValue(data.tax_id);
        this.fc.note.setValue(data.note);
        this.fc.remark.setValue(
          data.remark ||
            "<p>- ใบเสนอราคามีอายุ 14 วันนับจากวันที่เปิดใบเสนอราคา<p><p>- ราคาและรายละเอียดสินค้าให้ยึดตามรายละเอียดใบเสนอราคา<p>"
        );
      } else {
        // case quotation already have customer data
        this.fc.customer_code.setValue(this.dataSource.customer_code);
        this.fc.customer_name.setValue(this.dataSource.customer_name);
        this.fc.dealer.setValue(this.dataSource.dealer);
        this.fc.phone.setValue(this.dataSource.phone);
        this.fc.email.setValue(this.dataSource.email);
        this.fc.line.setValue(this.dataSource.line);
        this.fc.customer_type.setValue(this.dataSource.customer_type || "VAT");
        this.fc.payment_type.setValue(
          this.dataSource.payment_type || this.payment_type_default
        );
        this.fc.payment_remark.setValue(this.dataSource.payment_remark);
        this.fc.shipping_type.setValue(
          this.dataSource.shipping_type || this.shipping_type_default
        );
        this.fc.shipping_detail.setValue(this.dataSource.shipping_detail);
        this.fc.tax_address.setValue(this.dataSource.tax_address);
        this.fc.tax_id.setValue(this.dataSource.tax_id);
        this.fc.note.setValue(this.dataSource.note);
        this.fc.remark.setValue(
          this.dataSource.remark ||
            "<p>- ใบเสนอราคามีอายุ 14 วันนับจากวันที่เปิดใบเสนอราคา<p><p>- ราคาและรายละเอียดสินค้าให้ยึดตามรายละเอียดใบเสนอราคา<p>"
        );
      }

      this.currentCustomerData = data;
      this.changeDetectorRef.detectChanges();
    });
  }

  fetchShippingData() {
    this.shippingService
      .findBy({
        sort: { sequence: 1 },
        filter: {},
      })
      .subscribe((d: any) => {
        this.shipping_type_datas = d.results;
        if (
          this.shipping_type_datas.length > 0 &&
          !this.fc.shipping_type.value
        ) {
          this.fc.shipping_type.setValue(this.shipping_type_datas[0].title);
        }
        if (this.shipping_type_datas.length > 0) {
          this.shipping_type_default = this.shipping_type_datas[0].title;
        }
        this.changeDetectorRef.detectChanges();
      });
  }

  fetchPaymentData() {
    this.paymentService
      .findBy({
        sort: { sequence: 1 },
        filter: {},
      })
      .subscribe((d: any) => {
        this.payment_type_datas = d.results;
        if (this.payment_type_datas.length > 0 && !this.fc.payment_type.value) {
          this.fc.payment_type.setValue(this.payment_type_datas[0].title);
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
        // console.log("quotation data", data);
        let getQuotation = {
          _id: data._id,
          quotation_code: data.quotation_code,
          customer_code: data.customer_code,
          customer_name: data.customer_name,
          customer_type: data.customer_type,
          dealer: data.dealer,
          email: data.email,
          line: data.line,
          note: data.note,
          payment_remark: data.payment_remark,
          payment_type: data.payment_type,
          phone: data.phone,
          customer_remark: data.customer_remark,
          shipping_detail: data.shipping_detail,
          shipping_type: data.shipping_type,
          tax_address: data.tax_address,
          tax_id: data.tax_id,
          total_quantity: data.total_quantity,
          total_price: data.total_price,
          remark: data.remark,
          status: data.status,
          document_type: data.document_type,
          document_reference: data.document_reference,
          illustration: data.illustration,
          customer_id: data.customer_id,
          created: data.created,
          modified: data.modified,
          createdby: data.createdby,
          modifiedby: data.modifiedby,
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
          child_quotations: data.child_quotations,
        };

        if (data.status == this.qstatus.cancel) {
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
                          title: `ขนาด ${p.width} x ${p.height} ${stock.product_unit}`,
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
                          title: `ขนาด ${p.width} x ${p.height} ${stock.product_unit}`,
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
                      title: `ขนาด ${p.width} x ${p.height} ${stock.product_unit}`,
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
        this.fetchShippingData();
        this.fetchPaymentData();
        this.fetchCustomerData(data.customer_id);
      });
    }
  }

  onApprove() {
    this.dataSource.status = "อนุมัติแล้ว";
    this.dataSource.approved = Date.now();
    this.dataSource.approvedby = this.currentUser.fullname;
    this.dataSource.approved_role = this.currentUser.display_role;
    this.loading = true;
    this.approveResult = true;
    // console.log("update status", this.dataSource);
    let service = this.quotationService.updateStatusApprove(
      this.paramId,
      this.dataSource
    );

    service.subscribe(
      (data: any) => {
        // console.log("data return from approve", data);
        this.msgok = data.message;
        this.loading = false;
        this.approveResult = false;
        this.decline();
        // console.log("this.routepath.order", this.routepath.order);
        this.router.navigate([`/${this.routepath.order}`]);
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

  onEditCustomerData() {
    let editQuotation = {
      _id: this.dataSource._id,
      quotation_code: this.dataSource.quotation_code,
      customer_code: this.fc.customer_code.value,
      customer_name: this.fc.customer_name.value,
      dealer: this.fc.dealer.value,
      phone: this.fc.phone.value,
      email: this.fc.email.value,
      line: this.fc.line.value,
      customer_type: this.fc.customer_type.value,
      payment_type: this.fc.payment_type.value,
      payment_remark: this.fc.payment_remark.value,
      shipping_type: this.fc.shipping_type.value,
      shipping_detail: this.fc.shipping_detail.value,
      tax_address: this.fc.tax_address.value,
      tax_id: this.fc.tax_id.value,
      total_quantity: this.dataSource.total_quantity,
      total_price: this.dataSource.total_price,
      note: this.fc.note.value,
      remark: this.fc.remark.value,
      status: this.dataSource.status,
      document_type: this.dataSource.document_type,
      customer_id: this.dataSource.customer_id,
      created: this.dataSource.created,
      createdby: this.dataSource.createdby,
      created_role: this.currentUser.display_role,
      modified: Date.now(),
      modifiedby: this.currentUser.username,
      modified_role: this.currentUser.display_role,
    };

    this.loading = true;
    this.editCustomerResult = true;

    let service = this.quotationService.update(this.paramId, {
      quotation: editQuotation,
      stocks: [],
      deleteStocks: [],
      deleteProducts: [],
    });

    service.subscribe(
      (data: any) => {
        // update datasource customer info
        this.dataSource.customer_code = this.fc.customer_code.value;
        this.dataSource.customer_name = this.fc.customer_name.value;
        this.dataSource.dealer = this.fc.dealer.value;
        this.dataSource.phone = this.fc.phone.value;
        this.dataSource.email = this.fc.email.value;
        this.dataSource.line = this.fc.line.value;
        this.dataSource.customer_type = this.fc.customer_type.value;
        this.dataSource.payment_type = this.fc.payment_type.value;
        this.dataSource.payment_remark = this.fc.payment_remark.value;
        this.dataSource.shipping_type = this.fc.shipping_type.value;
        this.dataSource.shipping_detail = this.fc.shipping_detail.value;
        this.dataSource.tax_address = this.fc.tax_address.value;
        this.dataSource.tax_id = this.fc.tax_id.value;
        this.dataSource.total_quantity = this.dataSource.total_quantity;
        this.dataSource.total_price = this.dataSource.total_price;
        this.dataSource.note = this.fc.note.value;
        this.dataSource.remark = this.fc.remark.value;
        this.dataSource.status = this.dataSource.status;
        this.dataSource.document_type = this.dataSource.document_type;
        this.dataSource.customer_id = this.dataSource.customer_id;
        this.dataSource.created = this.dataSource.created;
        this.dataSource.createdby = this.dataSource.createdby;
        this.dataSource.created_role = this.currentUser.display_role;
        this.dataSource.modified = Date.now();
        this.dataSource.modifiedby = this.currentUser.username;
        this.dataSource.modified_role = this.currentUser.display_role;

        this.msgok = data.message;
        this.loading = false;
        this.editCustomerResult = false;
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

  onDuplicate() {
    // console.log(this.dataSource);
    // this.dataSource.status = "อนุมัติแล้ว";
    // this.dataSource.modified = Date.now();
    // this.dataSource.modifiedby = this.currentUser.username;
    this.loading = true;
    this.duplicateResult = true;
    // console.log("dup datasource", this.dataSource);
    let duplicateQuotaton = {
      ...this.dataSource,
      _id: "0",
      quotation_code: "0",
      status: "รออนุมัติ",
      document_type: "q",
      created: Date.now(),
      modified: Date.now(),
      createdby: this.currentUser.fullname,
      created_role: this.currentUser.display_role,
      modifiedby: this.currentUser.username,
      modified_role: this.currentUser.display_role,
    };

    // console.log("dup quotation", duplicateQuotaton);

    let service = this.quotationService.add(duplicateQuotaton);

    service.subscribe(
      (data: any) => {
        // console.log("data return from dup", data);
        this.msgok = data.message;
        this.loading = false;
        this.duplicateResult = false;
        this.decline();
        // this.router.navigate([
        //   `/${this.routepath.quotation}/${data.result._id}/view`,
        // ]);
        this.router.navigate([`/${this.routepath.quotation}`]);
        this.changeDetectorRef.detectChanges();
      },
      (error: any) => {
        this.error = error.message;
        this.loading = false;
        this.duplicateResult = false;
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
        this.onSaveData("status", this.qstatus.cancel);
        break;
    }
  }

  checkEmptyRemark(): boolean {
    return (
      this.cancelRemark == "" ||
      typeof this.cancelRemark == undefined ||
      this.cancelRemark == null
    );
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
        if (statusData == this.qstatus.cancel) {
          shareData["cancel_remark"] = this.cancelRemark;
        }
        break;
    }

    // console.log("shareData", shareData);
    let service = this.quotationService.update(this.paramId, {
      quotation: Object.assign(shareData, {
        modifiedby: this.currentUser.fullname,
        modified_role: this.currentUser.display_role,
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
            modifiedby: this.currentUser.fullname,
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
          title: "Bww - Quotation",
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
              `${self.dataSource.quotation_code} - ${self.currentCustomerData.customer_name}.pdf`
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
    this.deleteResult = true;
    this.dlgerror = "";
    this.quotationService.delete(this.paramId).subscribe(
      (data: any) => {
        this.declineConfirm();
        this.decline();
        setTimeout(() => {
          this.router.navigate([`/${this.routepath.quotation}`]);
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
      case "quotation": {
        this.router.navigate([
          `/${this.routepath.quotation}/${this.currentCustomerData._id}/${this.paramId}`,
        ]);
        break;
      }
      case "customer": {
        this.router.navigate([
          `/${this.routepath.customer}/${this.currentCustomerData._id}`,
        ]);
        break;
      }
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
