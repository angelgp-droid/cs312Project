import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedStateService {
  //shared service source: https://medium.com/@navneetskahlon/angular-communication-between-components-using-a-shared-service-394cb6201b19
  // and for rxjs https://angular.dev/ecosystem/rxjs-interop
  private selectedCellSource = new BehaviorSubject<string | null>(null);
  selectedCell$ = this.selectedCellSource.asObservable();

  selectCell(cellId: string) {
    this.selectedCellSource.next(cellId);
  }
}
