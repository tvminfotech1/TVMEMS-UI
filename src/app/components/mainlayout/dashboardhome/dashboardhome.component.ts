import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboardhome',
  templateUrl: './dashboardhome.component.html',
  styleUrls: ['./dashboardhome.component.css'],
})
export class DashboardhomeComponent implements OnInit {
  public userName = '';
  greeting: string = '';
  workInfo: string = '';
  public show: any = {
    workhours: true,
    wishes: false,
    hirings: false,
    holidays: false,
    workhistory: false,
    announcement: false,
  };

  isAdmin = false;
  isUser = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning! 🌞';
    } else if (hour < 17) {
      this.greeting = 'Good Afternoon! ☀️';
    } else {
      this.greeting = 'Good Evening! 🌙';
    }

    // Get user name from token
    this.userName = this.authService.getfullName() || 'User';

    // Check roles
    this.isAdmin = this.authService.isAdmin();
    this.isUser = this.authService.isUser();

    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  this.workInfo = `Happy ${day}! Let's make it a great one.`;
  }

  toggle(section: string) {
    for (let key in this.show) {
      this.show[key] = false;
    }
    this.show[section] = true;
  }

}
