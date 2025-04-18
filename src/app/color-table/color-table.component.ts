import { Component, Input, SimpleChange, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaintTableComponent } from '../paint-table/paint-table.component';

@Component({
  selector: 'app-color-table',
  standalone: true,
  imports: [CommonModule, FormsModule, PaintTableComponent],
  templateUrl: './color-table.component.html',
  styleUrl: './color-table.component.css'
})
//resource using for ... spread syntax 
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
export class ColorTableComponent{
  @Input() colorCount = 0;
  usedColors: Set<string> = new Set();
  selectedColors: string[] = [];
  availableColors: string[] = [];
  allColors: string[] = [
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['colorCount']) {
      this.initializeSelectedColors();
      this.updateAvailableColors();
    }
  }

  initializeSelectedColors() {
    // Reset previous values
    this.usedColors = new Set();
    this.selectedColors = [];

    for (let i = 0; i < this.colorCount; i++) {
      const availableColor = this.nextAvailableColor();
      if (availableColor) {
        this.usedColors.add(availableColor);
        this.selectedColors.push(availableColor);
      } else {
        this.selectedColors.push(this.allColors[0]);
      }
    }
    this.updateAvailableColors();
  }

  onColorChange(index: number, newColor: string) {
    const oldColor = this.selectedColors[index];

    this.selectedColors = [...this.selectedColors];
    this.selectedColors[index] = newColor;

    this.usedColors.delete(oldColor);
    this.usedColors = new Set(this.usedColors);
    this.usedColors.add(newColor);

    this.rebalanceColors();
    this.updateAvailableColors();
  }

  rebalanceColors() {
    const newUsedColors = new Set<string>();
    const newSelectedColors: string[] = [];

    for (const currentColor of this.selectedColors) {
      if (!newUsedColors.has(currentColor)) {
        newSelectedColors.push(currentColor);
        newUsedColors.add(currentColor);
      } else {
        const availableColor = this.nextAvailableColor();
        newSelectedColors.push(availableColor);
        newUsedColors.add(availableColor);
      }
    }
    this.selectedColors = newSelectedColors;
    this.usedColors = newUsedColors;
  }

  isColorAvailable(color: string, index: number): boolean {
    //allow already selected color to stay enabled
    if (this.selectedColors[index] === color) return true;
    return !this.usedColors.has(color);
  }

  nextAvailableColor(): string {
    for (const color of this.allColors) {
      if (!this.usedColors.has(color)) {
        return color;
      }
    }
    //default to the first color 
    return this.allColors[0];
  }

  updateAvailableColors() {
    this.availableColors = this.allColors.filter(color => !this.usedColors.has(color));
    this.availableColors = [...this.allColors];
  }

  get rows() {
    return Array.from({ length: this.colorCount }, (_, i) => i);
  }
}