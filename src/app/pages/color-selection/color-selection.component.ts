import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<{ message: string }>('https://cs.colostate.edu:4444/~EID/api.php')
    .subscribe({
      next: (response) => {
        console.log('Server Response:', response.message);
      },
      error: (e) => {
        console.error('Error connecting to database:', e.message || e.statusText);
      }
    });
  }

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