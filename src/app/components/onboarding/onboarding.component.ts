import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
})
export class OnboardingComponent {
  constructor(private router: Router) {}

  goToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  addUser() {
    this.router.navigate(['/signup']);
  }
}
