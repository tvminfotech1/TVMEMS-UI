import { Component } from '@angular/core';

@Component({
  selector: 'app-okr',
  templateUrl: './okr.component.html',
  styleUrls: ['./okr.component.css']
})
export class OkrComponent {
  selectedTab = 'active';
  reviews: any[] = []; 
}

