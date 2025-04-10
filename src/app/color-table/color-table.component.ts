import { Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-table',
  standalone:true,
  imports: [CommonModule, FormsModule],
  templateUrl: './color-table.component.html',
  styleUrl: './color-table.component.css'
})
export class ColorTableComponent {
  @Input() colorCount = 0;
  colors: string[] = [
    'black',
    'blue',
    'brown',
    'green',
    'orange',
    'pink',
    'purple',
    'red',
    'teal',
    'yellow'
  ];
  get rows(){
    const emptyArray = new Array(this.colorCount);
    const filledArray = emptyArray.fill(0);
    const rowsArray = filledArray.map((value, index) => index);
    return rowsArray;
  }
}
