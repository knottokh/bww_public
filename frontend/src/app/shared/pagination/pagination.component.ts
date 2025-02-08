import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
@Component({
  selector: "app-pagination",
  templateUrl: "./pagination.component.html",
  styleUrls: ["./pagination.component.scss"],
})
export class PaginationComponent implements OnInit {
  @Input() perPage: number;
  @Input() currentPage: number;
  @Input() totalItems: number;
  @Output() onPageChange: EventEmitter<any> = new EventEmitter();

  collection = [];
  config = {
    itemsPerPage: this.perPage,
    currentPage: this.currentPage,
    totalItems: this.totalItems,
  };
  maxSize: number = 7;
  directionLinks: boolean = true;
  autoHide: boolean = false;
  responsive: boolean = true;
  labels: any = {
    previousLabel: "ก่อนหน้า",
    nextLabel: "ถัดไป",
    screenReaderPaginationLabel: "Pagination",
    screenReaderPageLabel: "page",
    screenReaderCurrentLabel: `You're on page`,
  };

  constructor() {}

  ngOnInit(): void {}

  pageChange(event) {
    this.onPageChange.emit(event);
  }
}
