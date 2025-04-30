import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
  selectedColor: string = '';
  newColor: string = '';
  selectedColorToRemove: string = '';
  endpoint = 'https://cs.colostate.edu:4444/~c837205363/api.php';
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

  }
  
  removeColor(color: string) {
    
  }
}