import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, Router } from "@angular/router";
import { FormProgressService } from "../services/form-progress.service";
import { AuthService } from "../services/auth.service";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class StepGuard implements CanActivate {
  constructor(
    private progress: FormProgressService,
    private router: Router,
    private auth: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const stepNumber = route.data["step"];
    const employeeId = this.auth.getEmployeeId();
    const role = this.auth.getUserRole();
    const token = this.auth.getToken();
    const editMode = sessionStorage.getItem("editMode") === "true";


    if (role === "ROLE_ADMIN") {
      this.router.navigate(["/mainlayout/dashboard"]);
      return false;
    }

    if (!token ) {
      this.router.navigate(["/login"]);
      return false;
    }

    if (!employeeId) {
      this.router.navigate(["/login"]);
      return false;
    }

    return this.auth.checkOnboardingStatus(employeeId).pipe(
      map((status: boolean) => {
        if (status === true && !editMode) {
          this.router.navigate(["/mainlayout/dashboard"]);
          return false;
        }
      

        if (this.progress.canAccessStep(stepNumber)) {
          return true;
        } else {
          this.router.navigate(["/mainlayout/personal"]);
          return false;
        }
      }),

      catchError(() => {
        this.router.navigate(["/mainlayout/personal"]);
        return of(false);
      })
    );
  }
}
