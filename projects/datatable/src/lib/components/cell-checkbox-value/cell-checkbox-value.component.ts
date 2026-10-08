/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { GetPipe } from "../../pipes/get.pipe";
import { TransformPipe } from "../../pipes/transform.pipe";
import { DatatableCheckboxColumn } from "../../types/datatable-column.type";

@Component({
  selector: "lib-cell-checkbox-value",
  imports: [GetPipe, MatIconModule, TransformPipe],
  templateUrl: "./cell-checkbox-value.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./cell-checkbox-value.component.scss",
})
export class CellCheckboxValueComponent<Record> {
  @Input()
  column!: DatatableCheckboxColumn<Record>;

  @Input()
  row: any;
}
