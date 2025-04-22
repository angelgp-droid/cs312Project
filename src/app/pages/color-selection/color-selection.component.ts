import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './color-selection.component.html',
  styleUrl: './color-selection.component.css'
})
export class ColorSelectionComponent {
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
  selectedColor: string = '';
  newColor: string = '';
  selectedColorToRemove: string = '';

  addColor() {
    if (this.newColor && !this.colors.includes(this.newColor.toLowerCase())) {
      this.colors.push(this.newColor.toLowerCase());
      this.newColor = '';
    }
  }
  
  removeColor(color: string) {
    this.colors = this.colors.filter(c => c !== color);
    if (this.selectedColor === color) {
      this.selectedColor = '';
    }
  }
}