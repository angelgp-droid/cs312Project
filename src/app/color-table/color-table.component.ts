import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaintTableComponent } from '../paint-table/paint-table.component';
import { SharedStateService } from '../shared-state.service';

@Component({
  selector: 'app-color-table',
  standalone: true,
  imports: [CommonModule, FormsModule, PaintTableComponent],
  templateUrl: './color-table.component.html',
  styleUrl: './color-table.component.css'
})
export class ColorTableComponent {
  @Input() columns = 0;
  @Input() colorCount = 0;
  usedColors: Set<string> = new Set();
  selectedColors: string[] = [];
  availableColors: string[] = [];
  selectedCells: string[][] = [];
  activeRowIndex: number = 0;

  constructor(private sharedState: SharedStateService) {}

  allColors: string[] = [
    'black', 'blue', 'brown', 'green', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow'
  ];

  ngOnInit() {
    this.sharedState.selectedCell$.subscribe(selection => {
      if (selection) {
        const { cell } = selection;
        const activeRow = this.selectedCells[this.activeRowIndex];
        if (!activeRow.includes(cell)) {
          activeRow.push(cell);
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['colorCount']) {
      this.initializeSelectedColors();
      this.updateAvailableColors();
    }
  }

  initializeSelectedColors() {
    this.usedColors = new Set();
    this.selectedColors = [];
    this.selectedCells = new Array(this.colorCount).fill(null).map(() => []);

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
  
    // Notify shared state about color update
    this.sharedState.updateColor(oldColor, newColor);
  
    // 🔥 ALSO: if the edited row is active, update the active color!
    if (this.activeRowIndex === index) {
      this.sharedState.setActiveColor(newColor);
    }
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
    if (this.selectedColors[index] === color) return true;
    return !this.usedColors.has(color);
  }

  nextAvailableColor(): string {
    for (const color of this.allColors) {
      if (!this.usedColors.has(color)) {
        return color;
      }
    }
    return this.allColors[0];
  }

  updateAvailableColors() {
    this.availableColors = [...this.allColors];
  }

  get rows() {
    return Array.from({ length: this.colorCount }, (_, i) => i);
  }

  onSelectRow(index: number) {
    this.activeRowIndex = index;
    const activeColor = this.selectedColors[index];
    this.sharedState.setActiveColor(activeColor);
  }
}
