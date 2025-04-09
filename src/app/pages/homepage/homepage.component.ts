import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ColorTableComponent } from '../../color-table/color-table.component';

@Component({
  selector: 'app-homepage',
  standalone:true,
  imports: [FormsModule,CommonModule, ColorTableComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
//resource used https://angular.dev/guide/forms#
  rows: number = 0;
  columns: number = 0;
  color: number = 0;
  rowIsSubmitted = false;
  colIsSubmitted = false;
  colorIsSubmitted = false;
  showColorTable = true;
  rowSubmitCount = 0;
  colorSubmitCount = 0;
  colSubmitCount = 0;

  generateColorTable(){
    if(this.colSubmitCount > 0 && this.isColorValid()){
      const colorTable = [];
      for(let i = 0; i < this.color; i++){
        
      }
      this.showColorTable = true;


    }
  }

  generatePaintingTable(){
    if(this.colSubmitCount > 1 && this.rowSubmitCount> 1){
      
    }
  }

  isRowValid(): boolean {
    if (this.rowSubmitCount==0) return true;
    return this.rows !== null && 
           this.rows >= 1 && 
           this.rows <= 1000 &&
           Number.isInteger(this.rows);
  }

  isColValid(): boolean {
    if (this.colSubmitCount==0) return true;
    return this.columns !== null && 
           this.columns >= 1 && 
           this.columns <= 702 &&
           Number.isInteger(this.columns);
  }

  isColorValid(): boolean {
    if (this.colorSubmitCount==0) return true;
    return this.color !== null && 
           this.color >= 1 && 
           this.color <= 10 &&
           Number.isInteger(this.color);
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
    this.colorIsSubmitted = true;
    this.colorSubmitCount++;
    this.generateColorTable();
  }


}
