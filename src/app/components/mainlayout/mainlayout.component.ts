import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mainlayout',
  templateUrl: './mainlayout.component.html',
  styleUrls: ['./mainlayout.component.css']
})
export class MainlayoutComponent {
  showHomeDropdown = false;
  showWFHDropdown = false;
  showLeaveDropdown = false;
  showTimesheetDropdown = false;
  showTaskDropdown = false;
  showOKRDropdown = false;
  showOffboardingDropdown = false;
  showOnboardingDropdown = false;
  showAddJobDropdown = false;
  showSettings = false;
  showSearch = false;
  // router: any;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideDropdown = target.closest('.dropdown') || target.closest('.settings-wrapper') || target.closest('.search-input');
    if (!clickedInsideDropdown) {
      this.closeAllDropdowns();
    }
  }
  // Hide all dropdowns except the one passed
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

  toggleSettings() {
    const willShow = !this.showSettings;
    this.closeAllDropdowns(willShow ? 'settings' : '');
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
  }
  
 constructor(private router: Router) {}
  onLogout(): void {
    console.log('Logout clicked');
    localStorage.clear();
      sessionStorage.clear();
    this.router.navigateByUrl('/login'); 
  }
//   ngOnInit() {
//   const token = localStorage.getItem('userToken');
//   if (!token) {
//     this.router.navigate(['/login']);
//   }
// }
}