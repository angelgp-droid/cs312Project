import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ColorTableComponent } from '../../color-table/color-table.component';
import { PrintButtonComponent } from '../../print-button/print-button.component';
import { PaintTableComponent } from '../../paint-table/paint-table.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ColorTableComponent,
    PrintButtonComponent,
    PaintTableComponent
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
  rows: number = 0;
  columns: number = 0;
  rowIsSubmitted = false;
  colIsSubmitted = false;
  showColorTable = false;
  rowSubmitCount = 0;
  colSubmitCount = 0;
  colorSubmitCount = 0;


  availableColors: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('/api.php').subscribe({
      next: (res) => {
        this.availableColors = res.colors?.map((c: any) => c.name) || [];
    },
      error: (err) => {
        console.error('Failed to load colors from DB:', err);
    }
    });
  }

  shouldShowColorTable(): boolean {
  return this.showColorTable && this.availableColors.length > 0;
  }

  generateColorTable() {
    if (this.availableColors.length > 0) {
      this.colorSubmitCount++;
      this.showColorTable = true;
    }
  }

  isRowValid(): boolean {
    if (this.rowSubmitCount === 0) return true;
    return this.rows >= 1 && this.rows <= 1000 && Number.isInteger(this.rows);
  }

  isColValid(): boolean {
    if (this.colSubmitCount === 0) return true;
    return this.columns >= 1 && this.columns <= 702 && Number.isInteger(this.columns);
  }

  onRowSubmit() {
    this.rowIsSubmitted = true;
    this.rowSubmitCount++;
  }

  onColSubmit() {
    this.colIsSubmitted = true;
    this.colSubmitCount++;
  }
  
  onColorSubmit() {
  this.generateColorTable();
}
}
