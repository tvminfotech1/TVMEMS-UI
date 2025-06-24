import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { UserService } from "../user-service.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-certificate",
  templateUrl: "./certificate.component.html",
  styleUrls: ["./certificate.component.css"],
})
export class CertificateComponent {
  certificateList: any[] = [];

  certificateForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {
    this.certificateForm = this.formBuilder.group({
      certificateName: ["", Validators.required],
      certifiedBy: ["", Validators.required],
      completionDate: ["", Validators.required],
      marks: [
        "",
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
    });

    // Optional: you can sync form data with your userService if needed
    this.userService.setFormData("education", this.certificateForm);
  }

  addCertificate() {
    if (this.certificateForm.valid) {
      this.certificateList.push(this.certificateForm.value);
      this.userService.setFormData("certification", this.certificateList);
      this.certificateForm.reset();
    } else {
      alert("All fields are mandatory!");
    }
  }

  deleteCertificate(index: number) {
    this.certificateList.splice(index, 1);
  }

  finalSubmit() {
    if (this.certificateList.length > 0) {
      this.userService.setFormData("certification", this.certificateList);
      this.router.navigate(["/mainlayout/document"]);
    } else {
      alert("Please add at least one certificate.");
    }
  }
}
