import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedStateService {
  private selectedCellSource = new BehaviorSubject<{ cell: string, color: string } | null>(null);
  selectedCell$ = this.selectedCellSource.asObservable();

  private activeColorSource = new BehaviorSubject<string>('white');

  private colorUpdateSource = new BehaviorSubject<{ oldColor: string, newColor: string } | null>(null);
  colorUpdate$ = this.colorUpdateSource.asObservable();

  selectCell(cell: string, color: string) {
    this.selectedCellSource.next({ cell, color });
  }

  setActiveColor(color: string) {
    this.activeColorSource.next(color);
  }

  getActiveColor(): string {
    return this.activeColorSource.getValue();
  }

  updateColor(oldColor: string, newColor: string) {
    this.colorUpdateSource.next({ oldColor, newColor });
  }
}
