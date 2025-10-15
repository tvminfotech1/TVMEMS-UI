import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly BASE_URL = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  private formData: Record<string, any> = {};
  private formGroups: Record<string, FormGroup> = {};
  private documentData: FormData = new FormData();

  setFormData(step: string, data: any): void {
    this.formData[step] = data;
  }

  getFormData(key: string): any {
    return this.formData[key];
  }

  setUploadDoc(key: string, formData: FormData): void {
    if (!this.documentData) {
      this.documentData = new FormData();
    }

    for (const [name, value] of (formData as any).entries()) {
      this.documentData.append(name, value);
    }
  }

  getUploadDoc(): FormData {
    return this.documentData;
  }

  clearFormData(): void {
    this.formData = {};
    this.formGroups = {};
    this.documentData = new FormData();
  }

  getAllFormData(): Record<string, any> {
    return this.formData;
  }

  setFormGroup(step: string, formGroup: FormGroup): void {
    this.formGroups[step] = formGroup;
  }

  private optionalSteps: string[] = [
    'previousEmployee',
    'skills',
    'certification',
  ];

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

  submitJsonData(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token not found');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const jsonBody = this.getAllFormData();
    return this.http.post(`${this.BASE_URL}/personal/savejson`, jsonBody, {
      headers,
    });
  }

  uploadDocuments(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token not found');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(
      `${this.BASE_URL}/documents/upload`,
      this.documentData,
      { headers }
    );
  }
}
