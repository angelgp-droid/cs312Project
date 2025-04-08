import { Component } from '@angular/core';
import { TeamCardComponent } from '../../../team-card/team-card.component';

@Component({
  selector: 'app-about',
  imports: [TeamCardComponent],
  standalone:true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  teamMember ={
    name:'Name placeholder',
    bio:'Bio placeholder',
    photoURL:'personPlaceholder.jpg'
  }
}
