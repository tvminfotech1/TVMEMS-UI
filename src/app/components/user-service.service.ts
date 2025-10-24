import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly BASE_URL = 'http://localhost:8080';

  EmployeeId: number | null;

  private formData: Record<string, any> = {};
  private formGroups: Record<string, FormGroup> = {};
  private documentData: FormData = new FormData();

  private optionalSteps: string[] = [
    'previousEmployee',
    'skills',
    'certification',
  ];

  private maritalStatusSubject = new BehaviorSubject<string>('');
  maritalStatus$ = this.maritalStatusSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    const empIdStr = this.authService.getEmployeeId();
    this.EmployeeId = empIdStr ? Number(empIdStr) : null;
  }

  setFormData(step: string, data: any): void {
    this.formData[step] = data;
  }

  getFormData(step: string): any {
    return this.formData[step];
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

  setMaritalStatus(status: string): void {
    this.maritalStatusSubject.next(status);
  }

  clearFormData(): void {
    this.formData = {};
    this.formGroups = {};
    this.documentData = new FormData();
  }

  getAllFormData(): Record<string, any> {
    return this.formData;
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

  submitJsonData(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token not found');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const jsonBody = { employeeId: this.EmployeeId, ...this.getAllFormData() };

    return this.http.post(`${this.BASE_URL}/personal/savejson`, jsonBody, {
      headers,
    });
  }

  uploadDocuments(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token not found');

    if (this.EmployeeId) {
      this.documentData.append('employeeId', this.EmployeeId.toString());
    }

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
