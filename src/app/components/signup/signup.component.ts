// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { AuthService } from 'src/app/services/auth.service';

// @Component({
//   selector: 'app-signup',
//   templateUrl: './signup.component.html',
//   styleUrls: ['./signup.component.css']
// })
// export class SignupComponent implements OnInit {
//   signupForm!: FormGroup;

//   constructor(private fb: FormBuilder, private authService: AuthService) {}

//   ngOnInit(): void {
//     this.signupForm = this.fb.group(
//       {
//         fullName: ['', Validators.required],
//         mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
//         email: [
//           '',
//           [
//             Validators.required,
//             Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
//           ]
//         ],
        
//         aadhar: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
//         dob: ['', Validators.required],
//         gender: ['', Validators.required],
//         password: [
//           '',
//           [
//             Validators.required,
//             Validators.pattern(/^[A-Z](?=.*[a-zA-Z])(?=.*\d)(?=.*[@#$&])[A-Za-z\d@#$&]{7,}$/)
//           ]
//         ],
                
//         confirmPassword: ['', Validators.required]
//       },
//       { validators: this.passwordMatchValidator }
//     );
//   }

//   passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
//     const password = group.get('password')?.value;
//     const confirmPassword = group.get('confirmPassword')?.value;
//     return password === confirmPassword ? null : { mismatch: true };
//   }

//   onSubmit(): void {
//     if (this.signupForm.valid) {
//       const formData = { ...this.signupForm.value };
//       delete formData.confirmPassword;
//       console.log("signUp",formData)

//       this.authService.register(formData).subscribe({
//         next: (res) => {
//           console.log('Signup successful:', res);
//           this.signupForm.reset();
//           alert('Registration successful! Please check your email.');
//         },
//         error: (err) => {
//           console.error('Signup error:', err);
//           alert('Something went wrong. Please try again.');
//         }
//       });
//     } else {
//       this.signupForm.markAllAsTouched();
//     }
//   }
//    goBack() {
//     window.history.back();
//   }
// }


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  
showConfirmPassword: boolean = false;


  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group(
      {
        fullName: ['', Validators.required],
        mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        email: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
          ]
        ],
        
        aadhar: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
        dob: ['', Validators.required],
        gender: ['', Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[A-Z][a-z]{2,}[#@\$&][0-9]{2,}$/)
          ]
        ],
                
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  showPassword = false;

togglePassword() {
  this.showPassword = !this.showPassword;
}
toggleConfirmPassword() {
  this.showConfirmPassword = !this.showConfirmPassword;
}

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
  if (this.signupForm.valid) {
    const formValue = this.signupForm.value;

    // Format DOB to 'YYYY-MM-DDTHH'
    const formattedDOB = new Date(formValue.dob).toISOString().slice(0, 13);

    const payload = {
      fullName: formValue.fullName,
      mobile: Number(formValue.mobile),
      email: formValue.email,
      aadhar: formValue.aadhar,
      dob: formattedDOB,
      gender: formValue.gender,
      password: formValue.password,
      roles: ["string"]
    };

    console.log('Final payload:', payload);

    this.authService.register(payload).subscribe({
      next: (res) => {
        console.log('Signup successful:', res);
        this.signupForm.reset();
        alert('Registration successful! Please check your email.');
      },
      error: (err) => {
        console.error('Signup error:', err);
        alert('Something went wrong. Please try again.');
      }
    });

  } else {
    this.signupForm.markAllAsTouched();
  }
}

   goBack() {
    window.history.back();
  }
}