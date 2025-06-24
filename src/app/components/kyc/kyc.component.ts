import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../user-service.service";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-kyc",
  templateUrl: "./kyc.component.html",
  styleUrls: ["./kyc.component.css"],
})
export class KycComponent implements OnInit {
  kycForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.kycForm = this.formBuilder.group({
      pan: [
        "",
        [Validators.required, Validators.pattern(/[A-Z]{5}[0-9]{4}[A-Z]{1}/)],
      ],
      panName: ["", Validators.required],
      aadhar: ["", [Validators.required, Validators.pattern(/^\d{12}$/)]],
      aadharName: ["", Validators.required],
      uan: ["", [Validators.required, Validators.pattern(/^\d{12}$/)]],
      pf: ["", Validators.required],
      hdfc: ["", Validators.required],
    });

    this.userService.setFormGroup("kyc", this.kycForm);
    // this.loadKycJson();
  }

  // loadKycJson(): void {
  //   this.http.get<any>("assets/kyc.json").subscribe((data) => {
  //     this.kycForm.patchValue(data);
  //   });
  // }

  submitForm(): void {
    if (this.kycForm.valid) {
      this.userService.setFormData("kyc", this.kycForm.value);
      this.router.navigate(["/mainlayout/passport"]);
    } else {
      this.kycForm.markAllAsTouched();
    }
  }
}
