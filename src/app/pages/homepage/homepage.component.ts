import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-homepage',
  standalone:true,
  imports: [FormsModule,CommonModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
//resource used https://angular.dev/guide/forms#
  rows: number | null = null;
  columns: number | null = null;
  color: number | null = null;
  rowIsSubmitted = false;
  colIsSubmitted = false;
  colorIsSubmitted = false;
  isRowValid(): boolean{
    if (!this.rowIsSubmitted) return true;
    else{
      return this.rows !== null && 
      this.rows >= 1 && 
      this.rows <= 1000 &&
      Number.isInteger(this.rows);
    }
  }

  isColValid(): boolean{
    if (!this.colIsSubmitted) return true;
    else{
      return this.columns !== null && 
      this.columns >= 1 && 
      this.columns <= 702 &&
      Number.isInteger(this.columns);
    }
  }

  isColorValid(): boolean{
    if (!this.colorIsSubmitted) return true;
    else{
      return this.color !== null && 
      this.color >= 1 && 
      this.color <= 10 &&
      Number.isInteger(this.color);
    }
  }

  onRowSubmit() {
    this.rowIsSubmitted = true;
  }

  onColSubmit() {
    this.colIsSubmitted = true;
  }

  onColorSubmit() {
    this.colorIsSubmitted = true;
  }
}
