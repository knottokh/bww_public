import { NgModule } from "@angular/core";
/*import {
  MatToolbarModule,
  MatFormFieldModule,
  MatInputModule,
  MatCardModule,
  MatOptionModule,
  MatSelectModule,
  MatIconModule,
  MatButtonModule,
  MatTableModule,
  MatDividerModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatMenuModule,
  MatSlideToggleModule,
  MatCheckboxModule,
  MatDialogModule,
  MatListModule,
  MatProgressBarModule,
  MatPaginatorModule,
  MatExpansionModule,
  MatTabsModule,
  MatChipsModule
} from '@angular/material';*/
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { MatDividerModule } from "@angular/material/divider";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatMenuModule } from "@angular/material/menu";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { MatListModule } from "@angular/material/list";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSortModule } from "@angular/material/sort";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatTabsModule } from "@angular/material/tabs";
import { MatChipsModule } from "@angular/material/chips";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatRadioModule } from "@angular/material/radio";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatNativeDateModule } from "@angular/material/core";
import { ClipboardModule } from "@angular/cdk/clipboard";

import { MatPasswordStrengthModule } from "@angular-material-extensions/password-strength";
import { SatDatepickerModule, SatNativeDateModule } from "saturn-datepicker";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
  NgxMatNativeDateModule,
} from "@angular-material-components/datetime-picker";
import { MatTableExporterModule } from "mat-table-exporter";

const materails = [
  MatToolbarModule,
  MatFormFieldModule,
  MatInputModule,
  MatCardModule,
  //MatOptionModule,
  MatSelectModule,
  MatIconModule,
  MatButtonModule,
  MatTableModule,
  MatDividerModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatMenuModule,
  MatPasswordStrengthModule,
  MatSlideToggleModule,
  MatCheckboxModule,
  MatDialogModule,
  MatListModule,
  MatProgressBarModule,
  MatSortModule,
  MatPaginatorModule,
  MatExpansionModule,
  MatTabsModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatRadioModule,
  ClipboardModule,
  DragDropModule,
  SatDatepickerModule,
  SatNativeDateModule,
  NgxMaterialTimepickerModule,
  NgxMatTimepickerModule,
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  MatTableExporterModule,
];

@NgModule({
  imports: materails,
  exports: materails,
})
export class AppMaterialModule {}
