import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../user-service.service";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-family",
  templateUrl: "./family.component.html",
  styleUrls: ["./family.component.css"],
})
export class FamilyComponent {
  familyForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private http: HttpClient
  ) {
    this.familyForm = this.formBuilder.group({
      fatherName: ["", Validators.required],
      fatherDOB: ["", Validators.required],
      motherName: ["", Validators.required],
      motherDOB: ["", Validators.required],
      spouseName: [""],
      spouseDOB: [""],
      spouseGender: [""],
      children: ["", Validators.required],
    });

    this.userService.setFormGroup("family", this.familyForm);

    // this.http.get<any>("assets/family.json").subscribe((data) => {
    //   this.familyForm.patchValue(data);
    // });
  }

  submitForm() {
    if (this.familyForm.valid) {
      this.userService.setFormData("family", this.familyForm.value);
      this.router.navigate(["/mainlayout/previousEmployee"]);
    } else {
      this.familyForm.markAllAsTouched();
      alert("All fields are mandatory (if applicable)");
    }
  }
}
