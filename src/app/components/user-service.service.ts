import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly BASE_URL = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  private formData: Record<string, any> = {};
  private formGroups: Record<string, FormGroup> = {};

  setFormData(step: string, data: any): void {
    this.formData[step] = data;
  }

  getFormData(key: string): any {
    return this.formData[key];
  }

  setUploadDoc(step: string, formData: FormData): void {
    this.formData[step] = formData;
  }

  clearFormData(): void {
    this.formData = {};
    this.formGroups = {};
  }
  getAllFormData(): Record<string, any> {
    return this.formData;
  }

  setFormGroup(step: string, formGroup: FormGroup): void {
    this.formGroups[step] = formGroup;
  }

  isAllFormsValid(): boolean {
    return Object.keys(this.formGroups)
      .filter((step) => !this.optionalSteps.includes(step))
      .every((step) => this.formGroups[step].valid);
  }

  getInvalidSteps(): string[] {
    return Object.keys(this.formGroups)
      .filter((step) => !this.optionalSteps.includes(step))
      .filter((step) => !this.formGroups[step].valid);
  }

  private maritalStatusSubject = new BehaviorSubject<string>('');
  maritalStatus$ = this.maritalStatusSubject.asObservable();

  setMaritalStatus(status: string): void {
    this.maritalStatusSubject.next(status);
  }
  private optionalSteps: string[] = [
    'previousEmployee',
    'skills',
    'certification',
  ];

  submitAllForms(): FormData {
    const allData = this.formData;
    const formData = new FormData();
    Object.keys(allData).forEach((step) => {
      const stepData = allData[step];
      if (step !== 'documents') {
        formData.append(step, JSON.stringify(stepData));
      }
    });

    return formData;
  }
  submitFinalData(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token not found');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const allData = this.getAllFormData();

    const uploadFormData = allData['documents'];

    const finalFormData = this.submitAllForms();

    const upload$ = this.http.post(
      `${this.BASE_URL}/documents/upload`,
      uploadFormData,
      { headers }
    );

    const submit$ = this.http.post(
      `${this.BASE_URL}/personal/savejson`,
      finalFormData,
      { headers }
    );

    return forkJoin({
      upload: upload$,
      submit: submit$,
    });
  }
}
