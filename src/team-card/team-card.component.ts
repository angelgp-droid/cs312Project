import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'team-card',
  imports: [],
  standalone: true,
  templateUrl: './team-card.component.html',
  styleUrl: './team-card.component.css'
})
export class TeamCardComponent {
  @Input() name:string='';
  @Input() bio:string='';
  @Input() photoURL:string='';

}
