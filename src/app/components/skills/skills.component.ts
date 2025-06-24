import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user-service.service';

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
    private router: Router
  ) {
    this.skillForm = this.formBuilder.group({
      skillName: ['', Validators.required],
      skillCategories: ['', Validators.required],
      versionNum: ['', Validators.required],
      experience_year: ['', Validators.required],
      experience_month: ['', Validators.required],
      selfRate: ['', Validators.required],
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
      this.showPopup = false;
    } else {
      this.skillForm.markAllAsTouched();
    }
  }

  deleteSkill(index: number): void {
    this.skillList.splice(index, 1);
  }

  finalSubmit(): void {
    if (this.skillList.length > 0) {
      this.userService.setFormData("skills", this.skillList);
      this.router.navigate(['/mainlayout/certificate']);
    } else {
      alert("Please add at least one skill");
    }
  }
}
