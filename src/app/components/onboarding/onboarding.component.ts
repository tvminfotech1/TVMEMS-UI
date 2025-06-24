import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent {
  constructor(private router: Router) {}
  // steps = [
  //   { label: 'Set up organization details', completed: true },
  //   { label: 'Add team members', completed: false },
  //   { label: 'Configure permissions', completed: false },
  //   { label: 'Upload branding/logo', completed: false },
  //   { label: 'Review dashboard', completed: false }
  // ];

  goToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  addUser() {
    this.router.navigate(['/signup']);
  }

  // openHelp() {
  //   console.log('Opening help/support...');
  // }
}
