import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter} from '@angular/core';
import { SharedStateService } from '../shared-state.service';

@Component({
  selector: 'app-paint-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paint-table.component.html',
  styleUrl: './paint-table.component.css'
})
export class PaintTableComponent implements OnChanges{
  @Input() rows: number = 0;
  @Input() columns: number = 0;
  @Output() cellSelected = new EventEmitter<string>();
  constructor(private sharedState: SharedStateService) {}

  columnLabels: string[] = [];

  ngOnChanges(changes: SimpleChanges){
    if (changes['columns']){
      this.columnLabels = this.generateColumnLabels(this.columns);
    }
  }

  generateColumnLabels(num: number): string[]{
    let labels: string[] = [];
    for(let i = 0; i < num; i++){
      labels.push(this.toExcelColumn(i));
    }
    return labels;
  }

  toExcelColumn(n: number): string {
    let result = '';
    n = n + 1;
    while(n > 0){
      const remainder = (n - 1) % 26;
      result = String.fromCharCode(65 + remainder) + result;
      n = Math.floor((n - 1) / 26);
    }
    return result;
  }
  
  cellClicked(row: number, colIndex: number) {
    const colLabel = this.columnLabels[colIndex - 1];
    const cellId = `${colLabel}${row}`;
    alert(cellId);
    this.sharedState.selectCell(cellId);
    console.log(`Sending: ${cellId}`);

  }

  createArray(length: number): number[] {
    return Array.from({ length }, (_, i) => i);
  }
  
  
}
