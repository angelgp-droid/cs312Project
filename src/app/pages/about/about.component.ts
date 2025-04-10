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
  Matthew ={
    name:'Matthew Schimmel',
    bio:'A senior C.S. Student from Kansas City, I like the outdoors, chess, and philosophy.',
    photoURL:'assets/MattPic.jpeg'
  };
  angel={
    name:'Angel Gonzalez Portillo',
    bio:'I am a CS major in my third-year with the general concentration. In my free time I like to play video games as well as going on hikes and watching TV.',
    photoURL:'assets/angelPic.jpeg'
  };
  nate={
    name:'Nate Barton',
    bio:'I am a fourth-year computer science student with a general concentration. Outside of class, I enjoy video games, working out, and cooking.',
    photoURL: 'assets/NatePic.jpg'
  };
  german ={
    name:'German Gutierrez Erives',
    bio:'I am a senior majoring in neuroscience and minoring in computer science. I love playing the accordion, producing music, and playing 8 ball.',
    photoURL:'assets/GermanPic.png'
  };
}
