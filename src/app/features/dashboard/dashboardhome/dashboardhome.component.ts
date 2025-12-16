import { Component, OnInit } from '@angular/core';
import {
  trigger,
  style,
  animate,
  transition,
} from '@angular/animations';
import { AuthService } from 'src/app/core/services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboardhome',
  templateUrl: './dashboardhome.component.html',
  styleUrls: ['./dashboardhome.component.css'],
  animations: [
    trigger('fadeSlideFromButton', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px) scale(0.95)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateY(15px) scale(0.98)' })
        ),
      ]),
    ]),
  ],
})
export class DashboardhomeComponent implements OnInit {
  public userName = '';
  greeting: string = '';
  workInfo: string = '';

  public show: any = {
    announcement: true,
    holidays: false,
    wishes: false,
  };
  greetingIcon: any;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

ngOnInit() {
  const hour = new Date().getHours();

  if (hour < 12) {
    this.greeting = 'Good Morning';
    this.greetingIcon = 'assets/images/morning.png';
  } else if (hour < 17) {
    this.greeting = 'Good Afternoon';
    this.greetingIcon = 'assets/images/afternoon.png';
  } else {
    this.greeting = 'Good Evening';
    this.greetingIcon = 'assets/images/half-moon.png';
  }

  this.userName = this.authService.getfullName() || 'User';

  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  this.workInfo = `Happy ${day}! Let's make it a great one.`;

  this.route.queryParams.subscribe((params) => {
    const section = params['section'];
    if (section && this.show.hasOwnProperty(section)) {
      Object.keys(this.show).forEach((key) => (this.show[key] = false));
      this.show[section] = true;
    }
  });
}


  toggle(section: string) {
    for (let key in this.show) this.show[key] = false;
    this.show[section] = true;
  }

  isActive(section: string): boolean {
    return this.show[section];
  }
}
