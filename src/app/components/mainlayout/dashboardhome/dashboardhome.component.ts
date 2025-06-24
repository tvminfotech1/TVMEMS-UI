import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboardhome',
  templateUrl: './dashboardhome.component.html',
  styleUrls: ['./dashboardhome.component.css'],
})
export class DashboardhomeComponent {
  public userName = 'Ramkumar Raja';
  greeting: string = '';
  public show: any = {
    workhours: true,
    wishes: false,
    hirings: false,
    holidays: false,
    workhistory: false,
    announcement: false,
  };

  ngOnInit() {
  const hour = new Date().getHours();

  if (hour < 12) {
    this.greeting = 'Good Morning! 🌞';
  } else if (hour < 17) {
    this.greeting = 'Good Afternoon! ☀️';
  } else {
    this.greeting = 'Good Evening! 🌙';
  }
}

  toggle(section: string) {
    for (let key in this.show) {
      this.show[key] = false;
    }
    this.show[section] = true;
  }
}
