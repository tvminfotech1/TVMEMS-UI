import { Component,OnInit } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  dropdownOpen = false;
  isLoggedIn:boolean = false;
  ngOnInit() {
    // this.isLoggedIn = !!localStorage.getItem('token');
  }
  // logoUrl = 'assets/images/logo.png'; 

  showLogin = true; // Initially show the Login form, toggle to Signup when false

  // Toggle between Login and Signup
  toggleForm(isLogin: boolean): void {
    this.showLogin = isLogin;
  }
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }
}
