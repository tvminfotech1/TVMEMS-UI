import { Component, HostListener,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-mainlayout',
  templateUrl: './mainlayout.component.html',
  styleUrls: ['./mainlayout.component.css']
})
export class MainlayoutComponent implements OnInit {
  // Dropdown visibility states
  showHomeDropdown = false;
  showWFHDropdown = false;
  showLeaveDropdown = false;
  showTimesheetDropdown = false;
  showTaskDropdown = false;
  showOKRDropdown = false;
  showOffboardingDropdown = false;
  showOnboardingDropdown = false;
  showAddJobDropdown = false;
  showPayrollDropdown = false;
  showSettings = false;
  showSearch = false;
  isAdmin: boolean = false;
  isUser: boolean = false;
  userName: string = '';
  employeeId!: string | null; 

  constructor(private router: Router,private authService: AuthService) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.isUser = this.authService.isUser();
    this.userName = this.authService.getfullName() || 'User';
    this.employeeId = this.authService.getEmployeeId();
    console.log("Employee ID from token:", this.employeeId);
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideDropdown = target.closest('.dropdown') || target.closest('.settings-wrapper') || target.closest('.search-input');
    if (!clickedInsideDropdown) {
      this.closeAllDropdowns();
    }
  }

  closeAllDropdowns(except: string = '') {
    this.showHomeDropdown = except === 'home';
    this.showWFHDropdown = except === 'wfh';
    this.showLeaveDropdown = except === 'leave';
    this.showTimesheetDropdown = except === 'timesheet';
    this.showTaskDropdown = except === 'task';
    this.showOKRDropdown = except === 'okr';
    this.showOffboardingDropdown = except === 'offboarding';
    this.showOnboardingDropdown = except === 'onboarding';
    this.showAddJobDropdown = except === 'addJob';
    this.showPayrollDropdown = except === 'payroll'; 
    this.showSettings = except === 'settings';
  }

  toggleHomeDropdown() {
    const willShow = !this.showHomeDropdown;
    this.closeAllDropdowns(willShow ? 'home' : '');
  }
  
  toggleWFHDropdown() {
    const willShow = !this.showWFHDropdown;
    this.closeAllDropdowns(willShow ? 'wfh' : '');
  }

  toggleLeaveDropdown() {
    const willShow = !this.showLeaveDropdown;
    this.closeAllDropdowns(willShow ? 'leave' : '');
  }

  toggleTimesheetDropdown() {
    const willShow = !this.showTimesheetDropdown;
    this.closeAllDropdowns(willShow ? 'timesheet' : '');
  }

  toggleTaskDropdown() {
    const willShow = !this.showTaskDropdown;
    this.closeAllDropdowns(willShow ? 'task' : '');
  }

  toggleOKRDropdown() {
    const willShow = !this.showOKRDropdown;
    this.closeAllDropdowns(willShow ? 'okr' : '');
  }

  toggleOffboardingDropdown() {
    const willShow = !this.showOffboardingDropdown;
    this.closeAllDropdowns(willShow ? 'offboarding' : '');
  }


  toggleOnboardingDropdown() {
    const willShow = !this.showOnboardingDropdown;
    this.closeAllDropdowns(willShow ? 'onboarding' : '');
  }

  toggleAddJobDropdown() {
    const willShow = !this.showAddJobDropdown;
    this.closeAllDropdowns(willShow ? 'addJob' : '');
  }

  togglePayrollDropdown() {
    const willShow = !this.showPayrollDropdown;
    this.closeAllDropdowns(willShow ? 'payroll' : '');
  }

  toggleSettings() {
    const willShow = !this.showSettings;
    this.closeAllDropdowns(willShow ? 'settings' : '');
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
  }

  onLogout(): void {
    console.log('Logout clicked');
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigateByUrl('/adminLogin');
  }
   goToProfile() {
    console.log('Go to profile clicked');
    this.router.navigate(['/mainlayout/myprofile',this.employeeId]);
  }

  isChildRouteActive(keywords: string[]): boolean {
    return keywords.some(path => this.router.url.includes(path));
  }
}
