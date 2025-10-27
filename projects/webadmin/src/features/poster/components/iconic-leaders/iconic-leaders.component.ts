import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'dftwa-iconic-leaders',
  imports: [FormsModule, MatInputModule, MatSlideToggleModule, MatButtonModule, MatIconModule],
  templateUrl: './iconic-leaders.component.html',
  styleUrl: './iconic-leaders.component.scss'
})
export class IconicLeadersComponent {
  checked = true
  maxLeaders = 0
  leaderType = "circle"
  types = ['rectangle', 'square', 'circle']

  plus(event: MouseEvent) {
    this.maxLeaders++
  }
  
  minus(event: MouseEvent) {
    this.maxLeaders--
  }

}
