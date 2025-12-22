import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class OnboardingPatchService {
  private onboardingData: any = null;

  setOnboardingData(data: any): void {
    this.onboardingData = data;
  }

  getOnboardingData(): any {
    return this.onboardingData;
  }

  patchSection(form: FormGroup, sectionData: any): void {
    if (!form || !sectionData) return;

    Object.keys(form.controls).forEach((key) => {
      if (sectionData[key] !== undefined && sectionData[key] !== null) {
        form.controls[key].patchValue(sectionData[key]);
      }
    });
  }
}
