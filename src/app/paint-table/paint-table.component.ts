import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { SharedStateService } from '../shared-state.service';

@Component({
  selector: 'app-paint-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paint-table.component.html',
  styleUrl: './paint-table.component.css'
})
export class PaintTableComponent implements OnInit, OnChanges {
  @Input() rows: number = 0;
  @Input() columns: number = 0;

  columnLabels: string[] = [];
  cellColors: { [cell: string]: string } = {};

  constructor(private sharedState: SharedStateService) {}

  ngOnInit() {
    // Listen for cell clicks
    this.sharedState.selectedCell$.subscribe(selection => {
      if (selection) {
        const { cell, color } = selection;
        this.cellColors[cell] = color;
      }
    });

    // Listen for color updates
    this.sharedState.colorUpdate$.subscribe(update => {
      if (update) {
        const { oldColor, newColor } = update;
        for (const cell in this.cellColors) {
          if (this.cellColors[cell] === oldColor) {
            this.cellColors[cell] = newColor;
          }
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['columns']) {
      this.columnLabels = this.generateColumnLabels(this.columns);
    }
  }

  generateColumnLabels(num: number): string[] {
    let labels: string[] = [];
    for (let i = 0; i < num; i++) {
      labels.push(this.toExcelColumn(i));
    }
    return labels;
  }

  toExcelColumn(n: number): string {
    let result = '';
    n = n + 1;
    while (n > 0) {
      const remainder = (n - 1) % 26;
      result = String.fromCharCode(65 + remainder) + result;
      n = Math.floor((n - 1) / 26);
    }
    return result;
  }

  cellClicked(row: number, colIndex: number) {
    const colLabel = this.columnLabels[colIndex - 1];
    const cellId = `${colLabel}${row}`;
    console.log(`Clicked: ${cellId}`);

    const activeColor = this.sharedState.getActiveColor();
    if (activeColor) {
      this.cellColors[cellId] = activeColor;
      this.sharedState.selectCell(cellId, activeColor);
    }
  }

  createArray(length: number): number[] {
    return Array.from({ length }, (_, i) => i);
  }

  getCellColor(cellId: string): string {
    return this.cellColors[cellId] || 'white';
  }
}
