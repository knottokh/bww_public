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
import { SatDatepickerModule, SatNativeDateModule } from "saturn-datepicker";
import { RouterPath, User, QStatus, QStockType } from "src/app/_models";
import {
  AuthenticationService,
  CustomerService,
  QuotationService,
} from "src/app/_services";
import * as moment from "moment-timezone";
import { MatPaginator } from "@angular/material/paginator";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "saturn-datepicker";
import { MomentDateAdapter } from "@angular/material-moment-adapter";

const formatDate = "DD/MM/YYYY";

const MY_FORMATS = {
  parse: {
    dateInput: formatDate,
  },
  display: {
    dateInput: formatDate,
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "L",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

moment.locale("th");

@Component({
  selector: "app-report",
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ReportComponent implements OnInit {
  routepath: any;
  modalRef: BsModalRef;
  //modalRef2: BsModalRef;
  @ViewChild("paginator", { read: MatPaginator }) paginator: MatPaginator;
  //@ViewChild(MatSort) sort: MatSort;

  reportHeader = "";

  displayedColumns = [
    // "created",
    "approved",
    "title",
    "product_code",
    "total_quantity",
    "createdby",
    "total_price",
  ];

  displayedGroupColumns = ["customer_code", "customer_name", "total"];

  // dataSource: any = [];
  // quotationCurrentDataSource: any = [];
  quotationCurrentDataSource = new MatTableDataSource<any>([]);
  quotationLastYearDataSource: any = [];

  customerDataSource: any = [];
  searchCustomerList: any = [];

  qstatus: any = QStatus;
  qstocktype: any = QStockType;

  dataForm: FormGroup;
  currentUser: User;

  dlgloading = false;
  dlgerror = "";
  dlgmsgok = "";

  groupfilter = "";
  groups: string[] = [];

  durationSelected = "monthNow";

  deleteElement: any = null;
  deleteResult = false;

  searchtype = "";
  searchCustomerText = "";

  reportType = ""; // per_customer, groupby

  searchCustomerBy = "customer_code"; // customer_code, customer_name
  y_axis_type = "quotation_approve_no";

  inputSearchText = "";

  // sorting = { created: 1 };
  sorting = { approved: 1 };
  startRow = 0;
  // pageSize = 20;
  pageSize = 999999;
  dataSourceCount = 0;
  dataSourceLoading = false;
  currentPage = 1;

  dateRangeDisp = { begin: new Date(), end: new Date() };
  reportTotalPrice = 0;
  reportData = [];
  myData = [
    ["London", 0, 5],
    ["New York", 13, 15],
    ["Paris", 40, 30],
    ["Berlin", 70, 30],
    ["Kairo", 100, 45],
  ];

  columnNames = ["วันที่", "ช่วงเวลาที่เลือก", "ช่วงเวลาที่เลือกปีที่แล้ว"];

  exportDataSource: any = [];
  percenLoading = 0;
  exportPageSize = 10000;
  // exportColumns = [
  //   "created",
  //   "quotation_code",
  //   "product_code",
  //   "total_quantity",
  //   "createdby",
  //   "total_price",
  // ];
  exportColumns = [
    "created",
    "quotation_code",
    "product_code",
    "total_quantity",
    "createdby",
    "total_price",
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

  monthOrder = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  chartOptions = {
    tooltip: {
      isHtml: true,
      textStyle: {
        fontSize: 16,
        bold: true,
      },
    },
    hAxis: {
      title: "วันที่",
      titleTextStyle: {
        fontSize: 16, // ปรับขนาดฟอนต์
        bold: true,
      },
    },
    vAxis: {
      title:
        this.y_axis_type === "quotation_approve_no"
          ? "จำนวนใบเสนอราคา"
          : "ยอดรวมใบเสนอราคา",
    },
    chartArea: {
      top: 80,
      left: 80,
      bottom: 120,
      right: 50,
    },
    legend: {
      position: "top",
    },
  };

  constructor(
    private authenticationService: AuthenticationService,
    private modalService: BsModalService,
    private quotationService: QuotationService,
    private customerService: CustomerService,
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
    this.searchtype = "per_customer";
    this.y_axis_type = "quotation_approve_no";
    this.onSearchClick();
    this.fetchCustomerData();
    // console.log(this.currentUser);
    // this.quotationCurrentDataSource.paginator = this.paginator;
  }

  fetchCustomerData() {
    this.dataSourceLoading = true;
    this.customerService.findBy({ filter: {} }).subscribe((d: any) => {
      // console.log("customer data", d.results);
      this.customerDataSource = d.results;
      this.searchCustomerList = d.results;
      this.changeDetectorRef.detectChanges();
      // this.searchStock("");
    });
  }

  onPageChange(event) {
    console.log(event);
    this.currentPage = event;
    this.startRow = (this.currentPage - 1) * this.pageSize;
    this.onSearchClick();
  }

  async onSearchClick(isExport = false, cb?) {
    this.reportType = this.searchtype;
    let quotationCurrent;
    let quotationLastyear;

    let dateand = [];
    let startdate;
    let enddate;

    this.setReportHeader();

    const searcharr = [];
    searcharr.push({ $eq: ["$document_type", "q"] });
    searcharr.push({ $eq: ["$status", this.qstatus.ordered] });
    // this.sorting.created = isExport ? 1 : -1;
    this.sorting.approved = isExport ? 1 : -1;
    if (this.searchCustomerText !== "") {
      let ormatch = [];
      let fieldarr = ["customer_code", "customer_name"];
      let customerInfo = this.searchCustomerText.split(`,`);
      for (let i = 0; i < fieldarr.length; i++) {
        ormatch.push({
          $regexMatch: {
            input: { $toLower: `$${fieldarr[i]}` },
            regex: `.*${customerInfo[i].toLowerCase()}.*`,
          },
        });
      }
      searcharr.push({
        $or: ormatch,
      });
    }

    if (isExport) {
      // dateand = [];
      // get only current approved.
      switch (this.durationSelected) {
        case "monthNow":
          startdate = moment(
            moment().startOf("month").format("YYYY-MM-DD 00:00:00"),
            "YYYY-MM-DD 00:00:00"
          ).utc();
          enddate = moment(
            moment().endOf("month").format("YYYY-MM-DD 00:00:00"),
            "YYYY-MM-DD 00:00:00"
          )
            .add(1, "days")
            .utc();
          dateand.push({
            $gte: [
              // "$created",
              "$approved",
              { $toDate: startdate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
            ],
          });
          dateand.push({
            $lt: [
              // "$created",
              "$approved",
              { $toDate: enddate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
            ],
          });
          searcharr.push({
            $and: dateand,
          });
          break;
        case "yearNow":
          startdate = moment(
            moment().startOf("year").format("YYYY-MM-DD 00:00:00"),
            "YYYY-MM-DD 00:00:00"
          ).utc();
          enddate = moment(
            moment().endOf("year").format("YYYY-MM-DD 00:00:00"),
            "YYYY-MM-DD 00:00:00"
          )
            .add(1, "days")
            .utc();
          dateand.push({
            $gte: [
              // "$created",
              "$approved",
              { $toDate: startdate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
            ],
          });
          dateand.push({
            $lt: [
              // "$created",
              "$approved",
              { $toDate: enddate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
            ],
          });
          searcharr.push({
            $and: dateand,
          });
          break;
        case "range":
          if (
            this.dateRangeDisp.begin !== null &&
            this.dateRangeDisp.end !== null
          ) {
            startdate = moment(
              moment(this.dateRangeDisp.begin).format("YYYY-MM-DD 00:00:00"),
              "YYYY-MM-DD 00:00:00"
            ).utc();
            enddate = moment(
              moment(this.dateRangeDisp.end).format("YYYY-MM-DD 00:00:00"),
              "YYYY-MM-DD 00:00:00"
            )
              .add(1, "days")
              .utc();
            dateand.push({
              $gte: [
                // "$created",
                "$approved",
                { $toDate: startdate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
              ],
            });
            dateand.push({
              $lt: [
                // "$created",
                "$approved",
                { $toDate: enddate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
              ],
            });

            searcharr.push({
              $and: dateand,
            });
          }
          break;
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
      this.fetchDataForExport(search, false, cb);
    } else {
      // not export get current and lastyear
      let search = {
        sort: this.sorting,
        startRow: this.startRow,
        endRow: this.pageSize,
      };
      switch (this.durationSelected) {
        case "monthNow":
          // console.log("month now");
          // console.log("date and first", dateand);
          startdate = moment(
            moment().startOf("month").format("YYYY-MM-DD 00:00:00"),
            "YYYY-MM-DD 00:00:00"
          ).utc();
          enddate = moment(
            moment().endOf("month").format("YYYY-MM-DD 00:00:00"),
            "YYYY-MM-DD 00:00:00"
          )
            .add(1, "days")
            .utc();
          dateand.push({
            $gte: [
              // "$created",
              "$approved",
              { $toDate: startdate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
            ],
          });
          dateand.push({
            $lt: [
              // "$created",
              "$approved",
              { $toDate: enddate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
            ],
          });
          searcharr.push({
            $and: dateand,
          });

          if (searcharr.length > 0) {
            search["filter"] = { $and: searcharr };
          } else {
            search["filter"] = {};
          }

          // console.log("SEarch", search);
          quotationCurrent = this.fetchData(search);

          // last year
          // remove $and now from array
          dateand = [];
          searcharr.pop();
          startdate = moment(
            moment()
              .subtract(1, "year")
              .startOf("month")
              .format("YYYY-MM-DD 00:00:00"),
            "YYYY-MM-DD 00:00:00"
          ).utc();
          enddate = moment(
            moment()
              .subtract(1, "year")
              .endOf("month")
              .format("YYYY-MM-DD 00:00:00"),
            "YYYY-MM-DD 00:00:00"
          )
            .add(1, "days")
            .utc();
          dateand.push({
            $gte: [
              "$approved",
              { $toDate: startdate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
            ],
          });
          dateand.push({
            $lt: [
              "$approved",
              { $toDate: enddate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
            ],
          });
          searcharr.push({
            $and: dateand,
          });
          // console.log("Dateand last", dateand);
          if (searcharr.length > 0) {
            search["filter"] = { $and: searcharr };
          } else {
            search["filter"] = {};
          }

          // console.log("SEarchLasr", search);
          quotationLastyear = this.fetchData(search);

          Promise.all([quotationCurrent, quotationLastyear]).then((values) => {
            this.mergeData(values[0], values[1]);
          });
          break;

        case "yearNow":
          startdate = moment(
            moment().startOf("year").format("YYYY-MM-DD 00:00:00"),
            "YYYY-MM-DD 00:00:00"
          ).utc();
          enddate = moment(
            moment().endOf("year").format("YYYY-MM-DD 00:00:00"),
            "YYYY-MM-DD 00:00:00"
          )
            .add(1, "days")
            .utc();
          dateand.push({
            $gte: [
              "$approved",
              { $toDate: startdate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
            ],
          });
          dateand.push({
            $lt: [
              "$approved",
              { $toDate: enddate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
            ],
          });
          searcharr.push({
            $and: dateand,
          });

          if (searcharr.length > 0) {
            search["filter"] = { $and: searcharr };
          } else {
            search["filter"] = {};
          }
          quotationCurrent = this.fetchData(search);

          // last year
          // remove $and now from array
          dateand = [];
          searcharr.pop();
          startdate = moment(
            moment()
              .subtract(1, "year")
              .startOf("year")
              .format("YYYY-MM-DD 00:00:00"),
            "YYYY-MM-DD 00:00:00"
          ).utc();
          enddate = moment(
            moment()
              .subtract(1, "year")
              .endOf("year")
              .format("YYYY-MM-DD 00:00:00"),
            "YYYY-MM-DD 00:00:00"
          )
            .add(1, "days")
            .utc();
          dateand.push({
            $gte: [
              "$approved",
              { $toDate: startdate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
            ],
          });
          dateand.push({
            $lt: [
              "$approved",
              { $toDate: enddate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
            ],
          });
          searcharr.push({
            $and: dateand,
          });

          if (searcharr.length > 0) {
            search["filter"] = { $and: searcharr };
          } else {
            search["filter"] = {};
          }
          quotationLastyear = this.fetchData(search);

          Promise.all([quotationCurrent, quotationLastyear]).then((values) => {
            this.mergeData(values[0], values[1]);
          });
          break;

        case "range":
          // select range
          if (
            this.dateRangeDisp.begin !== null &&
            this.dateRangeDisp.end !== null
          ) {
            // current
            startdate = moment(
              moment(this.dateRangeDisp.begin).format("YYYY-MM-DD 00:00:00"),
              "YYYY-MM-DD 00:00:00"
            ).utc();
            enddate = moment(
              moment(this.dateRangeDisp.end).format("YYYY-MM-DD 00:00:00"),
              "YYYY-MM-DD 00:00:00"
            )
              .add(1, "days")
              .utc();
            dateand.push({
              $gte: [
                "$approved",
                { $toDate: startdate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
              ],
            });
            dateand.push({
              $lt: [
                "$approved",
                { $toDate: enddate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
              ],
            });

            searcharr.push({
              $and: dateand,
            });

            if (searcharr.length > 0) {
              search["filter"] = { $and: searcharr };
            } else {
              search["filter"] = {};
            }

            // console.log("search current", search);
            quotationCurrent = this.fetchData(search);

            // last year
            dateand = [];
            searcharr.pop();

            let tokenStartDate = new Date(this.dateRangeDisp.begin);
            const startdateLastYear = moment(
              moment(tokenStartDate)
                .subtract(1, "year")
                .format("YYYY-MM-DD 00:00:00"),
              "YYYY-MM-DD 00:00:00"
            ).utc();
            // const startdateLastYear = moment(
            //   moment(
            //     tokenStartDate.setFullYear(tokenStartDate.getFullYear() - 1)
            //   ).format("YYYY-MM-DD 00:00:00"),
            //   "YYYY-MM-DD 00:00:00"
            // ).utc();
            let tokenEndDate = new Date(this.dateRangeDisp.end);
            const enddateLastYear = moment(
              moment(tokenEndDate)
                .subtract(1, "year")
                .format("YYYY-MM-DD 00:00:00"),
              "YYYY-MM-DD 00:00:00"
            )
              .add(1, "days")
              .utc();
            // const enddateLastYear = moment(
            //   moment(
            //     tokenEndDate.setFullYear(tokenEndDate.getFullYear() - 1)
            //   ).format("YYYY-MM-DD 00:00:00"),
            //   "YYYY-MM-DD 00:00:00"
            // )
            //   .add(1, "days")
            //   .utc();

            dateand.push({
              $gte: [
                "$approved",
                {
                  $toDate: startdateLastYear.format("YYYY-MM-DDTHH:mm:ss.SSS"),
                },
              ],
            });
            dateand.push({
              $lt: [
                "$approved",
                { $toDate: enddateLastYear.format("YYYY-MM-DDTHH:mm:ss.SSS") },
              ],
            });

            searcharr.push({
              $and: dateand,
            });

            if (searcharr.length > 0) {
              search["filter"] = { $and: searcharr };
            } else {
              search["filter"] = {};
            }
            // console.log("search last", search);
            quotationLastyear = this.fetchData(search);

            Promise.all([quotationCurrent, quotationLastyear]).then(
              (values) => {
                this.mergeData(values[0], values[1]);
              }
            );
          }
          break;
      }
    }

    // legacy code
    // if (this.durationSelected === "now") {
    //   let dateand = [];
    //   const startdate = moment(
    //     moment().startOf("month").format("YYYY-MM-DD 00:00:00"),
    //     "YYYY-MM-DD 00:00:00"
    //   ).utc();
    //   const enddate = moment(
    //     moment().endOf("month").format("YYYY-MM-DD 00:00:00"),
    //     "YYYY-MM-DD 00:00:00"
    //   )
    //     .add(1, "days")
    //     .utc();
    //   dateand.push({
    //     $gte: [
    //       "$created",
    //       { $toDate: startdate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
    //     ],
    //   });
    //   dateand.push({
    //     $lt: [
    //       "$created",
    //       { $toDate: enddate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
    //     ],
    //   });
    //   searcharr.push({
    //     $and: dateand,
    //   });

    //   let search = {
    //     sort: this.sorting,
    //     startRow: this.startRow,
    //     endRow: this.pageSize,
    //   };

    //   if (searcharr.length > 0) {
    //     search["filter"] = { $and: searcharr };
    //   } else {
    //     search["filter"] = {};
    //   }
    //   if (!isExport) {
    //     quotationCurrent = this.fetchData(search);
    //     if (
    //       this.dateRangeDisp.begin !== null &&
    //       this.dateRangeDisp.end !== null
    //     ) {
    //       let dateand = [];
    //       let tokenStartDate = new Date(this.dateRangeDisp.begin);
    //       const startdateLastYear = moment(
    //         moment(
    //           tokenStartDate.setFullYear(tokenStartDate.getFullYear() - 1)
    //         ).format("YYYY-MM-DD 00:00:00"),
    //         "YYYY-MM-DD 00:00:00"
    //       ).utc();
    //       let tokenEndDate = new Date(this.dateRangeDisp.end);
    //       const enddateLastYear = moment(
    //         moment(
    //           tokenEndDate.setFullYear(tokenEndDate.getFullYear() - 1)
    //         ).format("YYYY-MM-DD 00:00:00"),
    //         "YYYY-MM-DD 00:00:00"
    //       )
    //         .add(1, "days")
    //         .utc();

    //       dateand.push({
    //         $gte: [
    //           "$created",
    //           { $toDate: startdateLastYear.format("YYYY-MM-DDTHH:mm:ss.SSS") },
    //         ],
    //       });
    //       dateand.push({
    //         $lt: [
    //           "$created",
    //           { $toDate: enddateLastYear.format("YYYY-MM-DDTHH:mm:ss.SSS") },
    //         ],
    //       });

    //       searcharr.push({
    //         $and: dateand,
    //       });

    //       let search = {
    //         sort: this.sorting,
    //         startRow: this.startRow,
    //         endRow: this.pageSize,
    //       };

    //       if (searcharr.length > 0) {
    //         search["filter"] = { $and: searcharr };
    //       } else {
    //         search["filter"] = {};
    //       }

    //       quotationLastyear = this.fetchData(search);

    //       Promise.all([quotationCurrent, quotationLastyear]).then((values) => {
    //         this.mergeData(values[0], values[1]);
    //       });
    //     }
    //   } else {
    //     this.fetchDataForExport(search, false, cb);
    //   }
    // } else {
    //   // date between
    //   if (
    //     this.dateRangeDisp.begin !== null &&
    //     this.dateRangeDisp.end !== null
    //   ) {
    //     // current
    //     let dateand = [];
    //     const startdate = moment(
    //       moment(this.dateRangeDisp.begin).format("YYYY-MM-DD 00:00:00"),
    //       "YYYY-MM-DD 00:00:00"
    //     ).utc();
    //     const enddate = moment(
    //       moment(this.dateRangeDisp.end).format("YYYY-MM-DD 00:00:00"),
    //       "YYYY-MM-DD 00:00:00"
    //     )
    //       .add(1, "days")
    //       .utc();
    //     dateand.push({
    //       $gte: [
    //         "$created",
    //         // "$approved",
    //         { $toDate: startdate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
    //       ],
    //     });
    //     dateand.push({
    //       $lt: [
    //         "$created",
    //         // "$approved",
    //         { $toDate: enddate.format("YYYY-MM-DDTHH:mm:ss.SSS") },
    //       ],
    //     });

    //     searcharr.push({
    //       $and: dateand,
    //     });

    //     let search = {
    //       sort: this.sorting,
    //       startRow: this.startRow,
    //       endRow: this.pageSize,
    //     };

    //     if (searcharr.length > 0) {
    //       search["filter"] = { $and: searcharr };
    //     } else {
    //       search["filter"] = {};
    //     }
    //     // this.fetchDataSample(search, "quotationCurrentDataSource");
    //     if (!isExport) {
    //       quotationCurrent = this.fetchData(search);
    //       // last year
    //       if (
    //         this.dateRangeDisp.begin !== null &&
    //         this.dateRangeDisp.end !== null
    //       ) {
    //         let dateand = [];
    //         let tokenStartDate = new Date(this.dateRangeDisp.begin);
    //         const startdateLastYear = moment(
    //           moment(
    //             tokenStartDate.setFullYear(tokenStartDate.getFullYear() - 1)
    //           ).format("YYYY-MM-DD 00:00:00"),
    //           "YYYY-MM-DD 00:00:00"
    //         ).utc();
    //         let tokenEndDate = new Date(this.dateRangeDisp.end);
    //         const enddateLastYear = moment(
    //           moment(
    //             tokenEndDate.setFullYear(tokenEndDate.getFullYear() - 1)
    //           ).format("YYYY-MM-DD 00:00:00"),
    //           "YYYY-MM-DD 00:00:00"
    //         )
    //           .add(1, "days")
    //           .utc();

    //         dateand.push({
    //           $gte: [
    //             "$created",
    //             // "$approved",
    //             {
    //               $toDate: startdateLastYear.format("YYYY-MM-DDTHH:mm:ss.SSS"),
    //             },
    //           ],
    //         });
    //         dateand.push({
    //           $lt: [
    //             "$created",
    //             // "$approved",
    //             { $toDate: enddateLastYear.format("YYYY-MM-DDTHH:mm:ss.SSS") },
    //           ],
    //         });

    //         searcharr.push({
    //           $and: dateand,
    //         });

    //         let search = {
    //           sort: this.sorting,
    //           startRow: this.startRow,
    //           endRow: this.pageSize,
    //         };

    //         if (searcharr.length > 0) {
    //           search["filter"] = { $and: searcharr };
    //         } else {
    //           search["filter"] = {};
    //         }

    //         quotationLastyear = this.fetchData(search);

    //         Promise.all([quotationCurrent, quotationLastyear]).then(
    //           (values) => {
    //             // console.log("Return value", values);
    //             this.mergeData(values[0], values[1]);
    //           }
    //         );
    //       }
    //     } else {
    //       // fetchexport
    //       this.fetchDataForExport(search, false, cb);
    //     }
    //   }

    //   if (!isExport) {
    //     // last year
    //     if (
    //       this.dateRangeDisp.begin !== null &&
    //       this.dateRangeDisp.end !== null
    //     ) {
    //       let dateand = [];
    //       let tokenStartDate = new Date(this.dateRangeDisp.begin);
    //       const startdateLastYear = moment(
    //         moment(
    //           tokenStartDate.setFullYear(tokenStartDate.getFullYear() - 1)
    //         ).format("YYYY-MM-DD 00:00:00"),
    //         "YYYY-MM-DD 00:00:00"
    //       ).utc();
    //       let tokenEndDate = new Date(this.dateRangeDisp.end);
    //       const enddateLastYear = moment(
    //         moment(
    //           tokenEndDate.setFullYear(tokenEndDate.getFullYear() - 1)
    //         ).format("YYYY-MM-DD 00:00:00"),
    //         "YYYY-MM-DD 00:00:00"
    //       )
    //         .add(1, "days")
    //         .utc();

    //       dateand.push({
    //         $gte: [
    //           "$created",
    //           // "$approved",
    //           { $toDate: startdateLastYear.format("YYYY-MM-DDTHH:mm:ss.SSS") },
    //         ],
    //       });
    //       dateand.push({
    //         $lt: [
    //           "$created",
    //           // "$approved",
    //           { $toDate: enddateLastYear.format("YYYY-MM-DDTHH:mm:ss.SSS") },
    //         ],
    //       });

    //       searcharr.push({
    //         $and: dateand,
    //       });

    //       let search = {
    //         sort: this.sorting,
    //         startRow: this.startRow,
    //         endRow: this.pageSize,
    //       };

    //       if (searcharr.length > 0) {
    //         search["filter"] = { $and: searcharr };
    //       } else {
    //         search["filter"] = {};
    //       }

    //       quotationLastyear = this.fetchData(search);

    //       Promise.all([quotationCurrent, quotationLastyear]).then((values) => {
    //         this.mergeData(values[0], values[1]);
    //       });
    //     }
    //   }
    // }
  }

  setReportHeader() {
    this.reportHeader =
      this.y_axis_type === "quotation_approve_no"
        ? "รายงานจำนวนใบเสนอราคาที่อนุมัติ"
        : "รายงานยอดรวมใบเสนอราคาที่อนุมัติ";

    // ทางซ้าย
    this.chartOptions.vAxis.title =
      this.y_axis_type === "quotation_approve_no"
        ? "จำนวนใบเสนอราคา"
        : "ยอดรวมใบเสนอราคา";

    switch (this.durationSelected) {
      case "monthNow":
        // ข้างล่าง
        this.chartOptions.hAxis.title = `เดือน ${moment().format(
          "MMMM"
        )} ${moment().year()}`;
        this.reportHeader += ` เดือน ${moment().format(
          "MMMM"
        )} ${moment().year()}`;
        break;
      case "range":
        // ข้างล่าง
        this.chartOptions.hAxis.title = `วันที่ ${moment(
          new Date(this.dateRangeDisp.begin)
        ).format("DD/MM/YYYY")} ถึงวันที่ ${moment(
          new Date(this.dateRangeDisp.end)
        ).format("DD/MM/YYYY")}`;
        this.reportHeader += ` วันที่ ${moment(
          new Date(this.dateRangeDisp.begin)
        ).format("DD/MM/YYYY")} ถึงวันที่ ${moment(
          new Date(this.dateRangeDisp.end)
        ).format("DD/MM/YYYY")}`;
        break;

      case "yearNow":
        // ข้างล่าง
        this.chartOptions.hAxis.title = `ปี ${moment().year()}`;
        this.reportHeader += ` ปี ${moment().year()}`;
        break;
    }
  }

  onEditApproveAllClick() {
    this.quotationService.updateAllApprove({ data: {} }).subscribe((d: any) => {
      // console.log("update all result", d);
    });
  }

  onUpdateTotalClick() {
    this.quotationService.findNoTotal({ data: {} }).subscribe((d: any) => {
      // console.log("no total", d.results);
      let nototalList = d.results;
      if (nototalList.length > 0) {
        // loop datalist to add total_quantity, total_price
        for (let i = 0; i < nototalList.length; i++) {
          let total_quantity = 0;
          let total_price = 0;
          if (nototalList[i].stocks.length > 0) {
            for (let s = 0; s < nototalList[i].stocks.length; s++) {
              if (
                nototalList[i].stocks[s].stock_type !== this.qstocktype.order
              ) {
                total_quantity += +nototalList[i].stocks[s].quantity;
                total_price +=
                  +nototalList[i].stocks[s].price *
                  +nototalList[i].stocks[s].quantity;
              }
            }
          }

          if (nototalList[i].products.length > 0) {
            for (let j = 0; j < nototalList[i].products.length; j++) {
              total_quantity += +nototalList[i].products[j].quantity;
              total_price +=
                +nototalList[i].products[j].price *
                +nototalList[i].products[j].quantity;
            }
          }

          nototalList[i].total_quantity = total_quantity;
          nototalList[i].total_price = total_price;
        }
      }

      // console.log("notatlList:", nototalList);

      // send list to update.
      this.quotationService.updateAllTotal(nototalList).subscribe((d: any) => {
        console.log("result", d);
        this.onSearchClick();
      });
    });
  }

  onSearchCustomerBySelect(selectedValue: string) {
    this.searchCustomerBy = selectedValue;
  }

  searchCustomer(searchValue: string) {
    this.inputSearchText = searchValue;
    if (this.searchCustomerBy == "customer_code") {
      // console.log(this.customerDataSource);
      this.searchCustomerList = this.customerDataSource.filter((customer) =>
        customer.customer_code.includes(searchValue)
      );
    } else {
      this.searchCustomerList = this.customerDataSource.filter((customer) =>
        customer.customer_name.includes(searchValue)
      );
    }
    this.changeDetectorRef.detectChanges();
  }

  onCustomerSelect(selectedCustomer) {
    this.searchCustomerText =
      selectedCustomer.customer_code + "," + selectedCustomer.customer_name;
    this.decline();
  }

  mergeData(quotationThisYear, quotationLastYear) {
    // console.log("quotation current:", quotationThisYear);
    // console.log("quotation lastyear:", quotationLastYear);
    this.reportData = [];
    let reportFormatList = [];
    switch (this.durationSelected) {
      case "monthNow":
      case "range":
        // step1: loop array 1 ไปเก็บในตัวแปร format ใหม่
        quotationThisYear.map((q) => {
          const existedIndex = reportFormatList.findIndex(
            (r) =>
              r[0].toString().substring(0, 5) ===
              q.approved.toString().substring(0, 5)
          );
          if (existedIndex > -1) {
            reportFormatList[existedIndex][1] +=
              this.y_axis_type == "quotation_approve_no" ? 1 : +q.total_price;
          } else {
            reportFormatList.push([
              q.approved,
              this.y_axis_type == "quotation_approve_no" ? 1 : +q.total_price,
              0,
            ]);
          }
        });

        // step2: loop array 2 เทียบตัวตัวแปร formatใหม่
        quotationLastYear.map((q) => {
          const existedIndexLast = reportFormatList.findIndex(
            (r) =>
              r[0].toString().substring(0, 5) ===
              q.approved.toString().substring(0, 5)
          );
          if (existedIndexLast > -1) {
            reportFormatList[existedIndexLast][2] +=
              this.y_axis_type == "quotation_approve_no" ? 1 : +q.total_price;
          } else {
            const parsedDate = moment(q.approved, "DD/MM/YYYY");
            const newApproved = parsedDate.year(moment().year());
            reportFormatList.push([
              newApproved.format("DD/MM/YYYY"),
              0,
              this.y_axis_type == "quotation_approve_no" ? 1 : +q.total_price,
            ]);
          }
        });

        this.reportData = reportFormatList.sort(
          (a, b) =>
            moment(a[0], "DD/MM/YYYY").toDate() -
            moment(b[0], "DD/MM/YYYY").toDate()
        );

        break;
      case "yearNow":
        const groupByMonth = (quotations) => {
          const grouped = quotations.reduce((result, { approved }) => {
            // const month = approved.split("/").slice(1).join("/");
            const monthNumber = approved.split("/")[1];

            const monthThai = moment(monthNumber, "MM").format("MMMM");

            if (!result[monthThai]) {
              result[monthThai] = 0;
            }
            result[monthThai] += 1;
            return result;
          }, {} as Record<string, number>);

          return Object.entries(grouped).map(([month, count]) => ({
            month: month,
            count,
          }));
        };

        const groupedThisYear = groupByMonth(quotationThisYear);
        const groupedLastYear = groupByMonth(quotationLastYear);

        // console.log("Thisyear", groupedThisYear);
        // console.log("Lastyear", groupedLastYear);

        // step1: loop array 1 ไปเก็บในตัวแปร format ใหม่
        groupedThisYear.map((q) => {
          reportFormatList.push([q.month, q.count, 0]);
        });

        // step2: loop array 2 เทียบตัวตัวแปร formatใหม่
        groupedLastYear.map((q) => {
          // const existedIndex = reportFormatList.findIndex(
          //   (r) => r[0].split("/")[0] === q.month.split("/")[0]
          // );
          const existedIndex = reportFormatList.findIndex(
            (r) => r[0] === q.month
          );
          if (existedIndex > -1) {
            reportFormatList[existedIndex][2] = q.count;
          } else {
            reportFormatList.push([q.month, 0, q.count]);
          }
        });

        this.reportData = reportFormatList.sort(
          (a, b) =>
            this.monthOrder.indexOf(a[0]) - this.monthOrder.indexOf(b[0])
        );

        break;
    }

    // console.log("reportData", this.reportData);

    // show data in table.
    switch (this.searchtype) {
      case "per_customer":
        this.quotationCurrentDataSource.data = quotationThisYear;
        break;
      case "groupby_customer_name":
        // group by here
        let quotationGroup = [];
        // let grouped = quotationThisYear.reduce(function (r, a) {
        //   r[`${a.customer_code}:${a.customer_name}`] =
        //     r[`${a.customer_code}:${a.customer_name}`] || [];
        //   r[`${a.customer_code}:${a.customer_name}`].push(a);
        //   return r;
        // }, Object.create(null));

        // Object.entries(grouped).forEach(([key, value]) => {
        //   let customer = key.split(":");
        //   let customer_code = customer[0];
        //   let customer_name = customer[1];
        //   let sumQuantityOrTotal = 0;
        //   let quotationList = Object.values(value);
        //   quotationList.map((q) => {
        //     sumQuantityOrTotal +=
        //       this.y_axis_type === "quotation_approve_no" ? 1 : q.total_price;
        //   });
        //   quotationGroup.push({
        //     customer_code: customer_code,
        //     customer_name: customer_name,
        //     total_quantity: sumQuantityOrTotal,
        //   });
        // });

        // console.log("quotation this year", quotationThisYear);
        let grouped = quotationThisYear.reduce(function (r, a) {
          r[`${a.customer_id}`] = r[`${a.customer_id}`] || [];
          r[`${a.customer_id}`].push(a);
          return r;
        }, Object.create(null));

        // console.log("Grouped", grouped);

        Object.entries(grouped).forEach(([key, value]) => {
          let sumQuantityOrTotal = 0;
          let quotationList = Object.values(value);
          quotationList.map((q) => {
            sumQuantityOrTotal +=
              this.y_axis_type === "quotation_approve_no" ? 1 : q.total_price;
          });
          quotationGroup.push({
            // customer_code: value["customer_code"],
            // customer_name: value["customer_name"],
            customer_code: value[0].customer_code,
            customer_name: value[0].customer_name,
            total_quantity: sumQuantityOrTotal,
          });
        });

        this.quotationCurrentDataSource.data = quotationGroup;
        break;
    }

    this.quotationCurrentDataSource.paginator = this.paginator;
    this.paginator.length = this.quotationCurrentDataSource.data.length;
    this.paginator.page.next();
    this.changeDetectorRef.detectChanges();
  }

  calculateTotalPrice() {
    let total = 0;

    this.quotationCurrentDataSource.data.forEach((d: any) => {
      total += d.total_price || 0;
    });

    return total;
  }

  async fetchData(search) {
    const response = await this.quotationService.findBy(search).toPromise();
    this.dataSourceCount = response["count"];
    let searchData = response["results"].map((d) => {
      const created = d.created;
      d.created = moment(created).format("DD/MM/YYYY");
      const approved = d.approved;
      d.approved = moment(approved).format("DD/MM/YYYY");
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
    // if (this.searchtype === "groupby_customer_name") {
    //   // groupby
    //   let grouped = searchData.reduce(function (r, a) {
    //     r[`${a.customer_code}:${a.customer_name}`] =
    //       r[`${a.customer_code}:${a.customer_name}`] || [];
    //     r[`${a.customer_code}:${a.customer_name}`].push(a);
    //     return r;
    //   }, Object.create(null));

    //   Object.entries(grouped).forEach(([key, value]) => {
    //     let customer = key.split(":");
    //     let customer_code = customer[0];
    //     let customer_name = customer[1];
    //     let sumQuantityOrTotal = 0;
    //     let quotationList = Object.values(value);
    //     quotationList.map((q) => {
    //       // console.log(`key: ${key} quotation: ${q.quotation_code}`);
    //       sumQuantityOrTotal +=
    //         this.y_axis_type === "quotation_approve_no" ? 1 : q.total_price;
    //     });

    //   });
    // }
    // return searchData.filter((f) => f.status == this.qstatus.ordered);
    return searchData;
  }

  fetchDataForExport(search, ispush, cb) {
    if (this.exportDataSource.length == 0 || ispush) {
      if (!ispush) {
        this.percenLoading = 0;
        search["startRow"] = 0;
        search["endRow"] = this.exportPageSize;
      }
      // console.log("search", search);
      this.reportTotalPrice = 0;
      this.quotationService.findBy(search).subscribe((d: any) => {
        // console.log("fetchDataForExport", d.results);
        // console.log("fetchDataForExport",this.exportDataSource.length);
        //const startseq = this.exportDataSource.length;

        let mapresult = [];

        mapresult = d.results.map((d) => {
          this.reportTotalPrice += d.total_price || 0;
          const approved = d.approved;
          d.approved = moment(approved).format("DD/MM/YYYY");
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
          // console.log("if in d.count works!");
          search.startRow = this.exportDataSource.length;
          this.fetchDataForExport(search, true, cb);
        } else {
          // group by here
          if (this.searchtype === "groupby_customer_name") {
            // console.log("export datasource:", this.exportDataSource);
            let groupResult = [];
            let grouped = this.exportDataSource.reduce(function (r, a) {
              r[`${a.customer_code}:${a.customer_name}`] =
                r[`${a.customer_code}:${a.customer_name}`] || [];
              r[`${a.customer_code}:${a.customer_name}`].push(a);
              return r;
            }, Object.create(null));

            Object.entries(grouped).forEach(([key, value]) => {
              let customer = key.split(":");
              let customer_code = customer[0];
              let customer_name = customer[1];
              let sumQuantityOrTotal = 0;
              let quotationList = Object.values(value);
              quotationList.map((q) => {
                sumQuantityOrTotal +=
                  this.y_axis_type === "quotation_approve_no"
                    ? 1
                    : q.total_price;
              });
              groupResult.push({
                customer_code: customer_code,
                customer_name: customer_name,
                total_quantity: sumQuantityOrTotal,
              });
            });
            this.exportDataSource = [];
            this.exportDataSource = groupResult.sort(
              (a, b) => b.total_quantity - a.total_quantity
            );
          }

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

  saveDate(event: any) {
    // look at how the date is emitted from save
    // console.log(event.target.value.begin);
    // console.log(event.target.value.end);

    // change in view
    this.dateRangeDisp = event.target.value;

    // save date range as string value for sending to db
    // this.field.value =
    //   new Date(event.target.value.begin) +
    //   "|" +
    //   new Date(event.target.value.end);
    // ... save to db
  }

  resetClick() {
    this.searchtype = "per_customer";
    this.searchCustomerText = "";
    this.onSearchClick();
  }

  openModal(template: TemplateRef<any>, element?: any) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-smart-search",
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

  exportExcel() {
    this.exportColumns = [];
    if (this.searchtype === "per_customer") {
      this.exportColumns = [
        "created",
        "quotation_code",
        "product_code",
        "total_quantity",
        "createdby",
        "total_price",
      ];
    } else {
      this.exportColumns = ["customer_code", "customer_name", "total_quantity"];
    }
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
}
