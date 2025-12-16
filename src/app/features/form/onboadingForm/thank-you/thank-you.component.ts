import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';


@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css'],
})
export class ThankYouComponent implements OnInit {
  employeeId: string | null = null;
  constructor(private router: Router, private authService:AuthService) {}

  ngOnInit(): void {
    this.employeeId = this.authService.getEmployeeId();
  }

  goToHome(): void {
    this.authService.checkOnboardingStatus(this.employeeId)
    this.router.navigate(['mainlayout/dashboard']);
  }
}
