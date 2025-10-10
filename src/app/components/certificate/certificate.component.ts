import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../user-service.service';
import { Router } from '@angular/router';
import { MainlayoutService } from 'src/app/services/main-layout.service';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css'],
})
export class CertificateComponent {
  today: Date = new Date();
  certificateList: any[] = [];
  showPopup = false;

  certificateForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private mainlayoutService: MainlayoutService
  ) {
    this.certificateForm = this.formBuilder.group({
      certificateName: ['', Validators.required],
      certifiedBy: ['', Validators.required],
      completionDate: ['', Validators.required],
      marks: [
        '',
        [Validators.required, Validators.pattern(/^(100|[0-9]{1,2})$/)],
      ],
    });
  }

  openPopup(): void {
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
    this.certificateForm.reset();
  }

  addCertificate() {
    if (this.certificateForm.valid) {
      this.certificateList.push(this.certificateForm.value);
      this.userService.setFormData('certification', this.certificateList);
      this.certificateForm.reset();
      this.closePopup();
    }
  }

  ngOnInit(): void {
    this.certificateForm = this.formBuilder.group({
      certificateName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[A-Za-z\s]+$/),
        ],
      ],
      certifiedBy: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[A-Za-z\s]+$/),
        ],
      ],
      completionDate: ['', Validators.required],
      marks: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.max(100),
          Validators.pattern(/^(100|[1-9][0-9]?)$/),
        ],
      ],
    });

    const savedCertificates = this.userService.getFormData('certification');
    if (savedCertificates && Array.isArray(savedCertificates)) {
      this.certificateList = savedCertificates;
    }
  }

  deleteCertificate(index: number) {
    this.certificateList.splice(index, 1);
  }

  finalSubmit(): void {
    if (this.certificateList.length > 0) {
      this.userService.setFormData('certification', this.certificateList);
      console.log('certification', this.certificateList);
      this.router.navigate(['/mainlayout/document']);
      this.mainlayoutService.markTabCompleted('certificate', true);
    } else {
      this.router.navigate(['/mainlayout/document']);
      console.log('certification', this.certificateList);
      this.mainlayoutService.markTabCompleted('certificate', true);
    }
  }

  preventInvalidInput(event: KeyboardEvent): void {
    if (['e', 'E', '+', '-', '.'].includes(event.key)) {
      event.preventDefault();
    }
  }

  back() {
    this.router.navigate(['/mainlayout/skills']);
  }

  blockMarksInput(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Delete',
    ];
    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
      return;
    }

    const input = event.target as HTMLInputElement;
    const newValue = input.value + event.key;
    if (Number(newValue) > 100) {
      event.preventDefault();
      return;
    }

    if (Number(newValue) === 0) {
      event.preventDefault();
      return;
    }
    if (newValue.length > 3) {
      event.preventDefault();
    }
  }

  blockCertificateNameInput(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'delete',
      ' ',
    ];
    const pattern = /[A-Za-z]/;

    if (!pattern.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }

    const input = event.target as HTMLInputElement;
    if (input.value.length >= 20) {
      event.preventDefault();
    }
  }

  blockCertifiedByInput(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'delete',
      ' ',
    ];
    const pattern = /[A-Za-z]/;

    if (!pattern.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }

    const input = event.target as HTMLInputElement;
    if (input.value.length >= 20) {
      event.preventDefault();
    }
  }
}
