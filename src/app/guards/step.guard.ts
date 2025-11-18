import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { FormProgressService } from '../services/form-progress.service';

@Injectable({
  providedIn: 'root'
})
export class StepGuard implements CanActivate {

  constructor(private progress: FormProgressService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const stepNumber = route.data['step'];
    if (this.progress.canAccessStep(stepNumber)) {
      return true;
    } else {
      this.router.navigate(['/mainlayout/personal']);
      return false;
    }
  }
}