import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MainlayoutService {

  private completedTabsSource = new BehaviorSubject<any>({
    personal: false,
    kyc: false,
    passport: false,
    family: false,
    previousEmployee: false,
    education: false,
    skills: false,
    certificate: false,
    document: false,
    resume: false,
    final: false
  });

  completedTabs$ = this.completedTabsSource.asObservable();

markTabCompleted(tabName: keyof typeof this.completedTabsSource.value, completed: boolean = true) {
  const updatedTabs = { ...this.completedTabsSource.value, [tabName]: completed };
  this.completedTabsSource.next(updatedTabs);
}


  getCompletedTabs() {
    return this.completedTabsSource.value;
  }
}
