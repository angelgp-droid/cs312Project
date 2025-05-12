import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Color {
  id: number;
  name: string;
  hex: string;
}

@Component({
  selector: 'app-color-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './color-selection.component.html',
  styleUrl: './color-selection.component.css'
})
export class ColorSelectionComponent {
  colors: Color[] = [];

  errorMessage: string = '';
  successMessage: string = '';

  newColor: string = '';
  newColorHex: string = '#000000';

  selectedColorToRemove: string = '';

  editMode: boolean = false;
  colorToEdit: Color | null = null;
  editColorName: string = '';
  editColorHex: string = '';

  endpoint = 'https://cs.colostate.edu:4444/~EID/api.php';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchColors();
  }

  fetchColors() {
    this.http.get<any>(this.endpoint).subscribe({
      next: (res) => {
        this.colors = res.colors || [];
      },
      error: () => {
        this.errorMessage = 'Failed to load colors.';
      }
    });
  }

  addColor() {
    this.clearMessages();

    const name = this.newColor.trim();
    const hex = this.newColorHex.trim();

    if (!name || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      this.errorMessage = 'Enter a valid name and hex code.';
      return;
    }

    this.http.post<any>(this.endpoint, { name, hex }).subscribe({
      next: () => {
        this.successMessage = 'Color added!';
        this.newColor = '';
        this.newColorHex = '#000000';
        this.fetchColors();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to add color.';
      }
    });
  }

  removeColor(colorName: string) {
    this.clearMessages();

    const color = this.colors.find(c => c.name === colorName);
    if (!color) {
      this.errorMessage = 'Color not found.';
      return;
    }

    if (this.colors.length <= 2) {
      this.errorMessage = 'At least two colors must remain.';
      return;
    }

    this.http.request<any>('DELETE', this.endpoint, {
      body: { id: color.id }
    }).subscribe({
      next: () => {
        this.successMessage = 'Color removed.';
        this.selectedColorToRemove = '';
        this.fetchColors();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to remove color.';
      }
    });
  }

  startEdit(color: Color) {
    this.editMode = true;
    this.colorToEdit = color;
    this.editColorName = color.name;
    this.editColorHex = color.hex;
    this.clearMessages();
  }

  updateColor() {
    if (!this.colorToEdit) return;

    const id = this.colorToEdit.id;
    const name = this.editColorName.trim();
    const hex = this.editColorHex.trim();

    if (!name || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      this.errorMessage = 'Enter valid name and hex.';
      return;
    }

    this.http.put<any>(this.endpoint, { id, name, hex }).subscribe({
      next: () => {
        this.successMessage = 'Color updated.';
        this.cancelEdit();
        this.fetchColors();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update color.';
      }
    });
  }

  cancelEdit() {
    this.editMode = false;
    this.colorToEdit = null;
    this.editColorName = '';
    this.editColorHex = '';
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
