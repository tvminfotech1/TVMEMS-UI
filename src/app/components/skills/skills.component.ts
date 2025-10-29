import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit {
  skillForm!: FormGroup;
  skillList: any[] = [];
  showPopup = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar

  ) {
    this.skillForm = this.formBuilder.group({
  skillName: [
    '',
    [
      Validators.required,
      Validators.pattern(/^[a-zA-Z\s.,&'-]+$/),
      Validators.minLength(3)
    ]
  ],
  skillCategories: ['', [
    Validators.required,
    Validators.pattern(/^[a-zA-Z\s.,&'-]+$/),
    Validators.minLength(3)
  ]
],
  versionNum: [
    '',
    [
      Validators.required,
      Validators.pattern('^[0-9]+(\\.[0-9]+)?$') 
    ]
  ],
  experience_year: [
    '',
    [
      Validators.required,
      Validators.pattern('^[0-9]+$'),
      Validators.min(1),
      Validators.max(15)
    ]
  ],
  experience_month: [
    '',
    [
      Validators.required,
      Validators.pattern('^[0-9]+$'),
      Validators.max(11) 
    ]
  ],
  selfRate: ['', [Validators.required]],
});

    this.userService.setFormGroup('skills', this.skillForm);
  }

  ngOnInit(): void {
    // Load saved data from service if available
    const savedSkills = this.userService.getFormData('skills');
    if (savedSkills && Array.isArray(savedSkills)) {
      this.skillList = savedSkills;
    }
  }

  openPopup(): void {
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
  }

  addSkill(): void {
    if (this.skillForm.valid) {
      this.skillList.push(this.skillForm.value);
      this.userService.setFormData("skills", this.skillList);
       this.skillForm.reset({
      skillName: '',
      skillCategories: '',
      versionNum: '',
      experience_year: null,
      experience_month: null,
      selfRate: null
    });
      this.showPopup = false;
    } else {
      this.skillForm.markAllAsTouched();
    }
  }

  deleteSkill(index: number): void {
    this.skillList.splice(index, 1);
  }

  finalSubmit(): void {
    if (this.skillList.length >= 3) {
      this.userService.setFormData("skills", this.skillList);
      this.router.navigate(['/mainlayout/certificate']);
      console.log("skill",this.skillList);
      
    } else {
      this.snackBar.open('Minimum 3 skills is required', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    }
  }

  preventInvalidInput(event: KeyboardEvent) {
  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault();
  }
}

previous(){

  this.router.navigate(['/mainlayout/education']);
}
}