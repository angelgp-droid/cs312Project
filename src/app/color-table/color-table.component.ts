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
  colors: string[] = [ 'red', 'orange', 'yellow', 'green', 'blue','purple', 'pink', 'brown', 'black', 'teal'];
  
}
