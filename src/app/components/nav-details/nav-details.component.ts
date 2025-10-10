import { Component, OnInit } from '@angular/core';
import { MainlayoutService } from 'src/app/services/main-layout.service'; 

@Component({
  selector: 'app-nav-details',
  templateUrl: './nav-details.component.html',
  styleUrls: ['./nav-details.component.css']
})
export class NavDetailsComponent implements OnInit {
  completedTabs: any = {}; 

  constructor(private mainLayoutService: MainlayoutService) {} 

  ngOnInit(): void {
    this.mainLayoutService.completedTabs$.subscribe(tabs => {
      this.completedTabs = tabs;
    });
  }
}
