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
  selectedColorToRemove: string = ''; // Add this property

  errorMessage: string = '';
  successMessage: string = '';
  
  newColorName: string = '';
  newColorHex: string = '#000000';
  
  editMode: boolean = false;
  colorToEdit: Color | null = null;
  editColorName: string = '';
  editColorHex: string = '';

  deleteMode: boolean = false;
  colorToDelete: Color | null = null;
  
  endpoint = 'https://cs.colostate.edu:4444/~gman0770/cs312Project/api.php';
  
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(this.endpoint).subscribe({
      next: (res) => {
        console.log('Full API response:', res);
        this.colors = res.colors || [];
      },
      error: (err) => {
        console.error('Failed to fetch colors:', err.message || err.statusText);
      }
    });
  }
  
  addColor() {
    const newColor = { name: this.newColorName.trim(), hex: this.newColorHex.trim() };

    this.http.post(this.endpoint, newColor).subscribe({
      next: () => {
        this.successMessage = 'Color added successfully!';
        this.errorMessage = '';
        this.newColorName = '';
        this.newColorHex = '#000000';
        this.ngOnInit(); // Reload colors
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Failed to add color.';
        this.successMessage = '';
      }
    });
  }

  editColor() {
    if (!this.colorToEdit) return;

    const updatedColor = { id: this.colorToEdit.id, name: this.editColorName.trim(), hex: this.editColorHex.trim() };

    this.http.put(this.endpoint, updatedColor).subscribe({
      next: () => {
        this.successMessage = 'Color updated successfully!';
        this.errorMessage = '';
        this.editMode = false;
        this.ngOnInit(); // Reload colors
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Failed to update color.';
        this.successMessage = '';
      }
    });
  }

  removeColor(colorName: string) { // Accept a color name as a parameter
    const colorToDelete = this.colors.find(color => color.name === colorName);
    if (!colorToDelete) {
      this.errorMessage = 'Color not found.';
      return;
    }

    const deleteUrl = `${this.endpoint}?id=${colorToDelete.id}`;

    this.http.delete(deleteUrl).subscribe({
      next: () => {
        this.successMessage = 'Color deleted successfully!';
        this.errorMessage = '';
        this.deleteMode = false;
        this.ngOnInit(); // Reload colors
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Failed to delete color.';
        this.successMessage = '';
      }
    });
  }
}