import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Color {
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
  
  newColorName: string = '';
  newColorHex: string = '#000000';
  
  editMode: boolean = false;
  colorToEdit: Color | null = null;
  editColorName: string = '';
  editColorHex: string = '';

  deleteMode: boolean = false;
  colorToDelete: Color | null = null;
  
  endpoint = 'https://cs.colostate.edu:4444/~EID/api.php';
  
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
    //first validate input
    //then condition the input values (trim and conbine)
    //then make a post
    //reload the colors and reset the form
  }
  
  removeColor(color: string) {
    
  }
}