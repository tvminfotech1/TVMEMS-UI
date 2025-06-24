import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../user-service.service";
import { Router } from "@angular/router";

@Component({
  templateUrl: "./final.component.html",
  styleUrls: ["./final.component.css"],
})
export class FinalComponent {
  declarationForm: FormGroup;

  constructor(
    private formbulder: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {
    this.declarationForm = this.formbulder.group({
      checked: [false, Validators.requiredTrue],
      signature: ["", Validators.required],
      date: ["", Validators.required],
    });
  }

  submitForm() {
    if (this.declarationForm.valid) {
      if (!this.userService.isAllFormsValid()) {
        const incompleteSteps = this.userService.getInvalidSteps();
        alert(
          "Please complete the following steps before submitting: " +
          incompleteSteps.join(", ")
        );
        return;
      }

      // Store only the form value (not the FormGroup itself)
      this.userService.setFormData("aFinal", this.declarationForm.value);

      const allData = {
        personal: this.userService.getFormData("personal"),
        kyc: this.userService.getFormData("kyc"),
        passport: this.userService.getFormData("passport"),
        family: this.userService.getFormData("family"),
        previousEmployment: this.userService.getFormData("previousEmployment"),
        education: this.userService.getFormData("education"),
        skills: this.userService.getFormData("skills"),
        certification: this.userService.getFormData("certification"),
        DocumentDetails: this.userService.getFormData("DocumentDetails"),
        resume: this.userService.getFormData("resume"),
        aFinal: this.userService.getFormData("aFinal"),
      };

      // Optional: check structure
      console.log('Submitting final data:', allData);

      this.userService.submitFinalData(allData).subscribe((res) => {
        if (res) {
          console.log('Server response:', res);
        }
      });

    } else {
      this.declarationForm.markAllAsTouched();
    }
  }
}
