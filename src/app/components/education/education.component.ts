import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserService } from "../user-service.service";

@Component({
  selector: "app-education",
  templateUrl: "./education.component.html",
  styleUrls: ["./education.component.css"],
})
export class EducationComponent implements OnInit {
  educationList: any[] = [];
  educationForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {
    this.educationForm = this.formBuilder.group({
      qualification: ["", Validators.required],
      specilization: ["", Validators.required],
      instituteName: ["", Validators.required],
      universityName: ["", Validators.required],
      time: ["", Validators.required],
      fromDate: ["", Validators.required],
      toDate: ["", Validators.required],
      percentage: ["", Validators.required],
      rollNo: ["", Validators.required],
      educationType: ["", Validators.required],
    });

    this.userService.setFormData("education", this.educationForm);
  }

  ngOnInit(): void {
    // If you want to retrieve previously saved data from the service:
    const savedData = this.userService.getFormData("educationList");
    if (savedData) {
      this.educationList = savedData;
    }
  }

  submitForm(): void {
    if (this.educationForm.valid) {
      // this.educationList.push();
      this.userService.setFormData("educationList", this.educationForm.value);
      this.router.navigate(["/mainlayout/skills"]);
    } else {
      this.educationForm.markAllAsTouched();
    }
  }
}
