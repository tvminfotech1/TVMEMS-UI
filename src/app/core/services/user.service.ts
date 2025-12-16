import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL } from '../constant/constant';

@Injectable({
  providedIn: 'root',
})
export class UserService {

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
  
    private educationTypeSubject = new BehaviorSubject<string | null>(null);

  educationType$ = this.educationTypeSubject.asObservable();

  setEducationType(type: string) {
    this.educationTypeSubject.next(type);
  }

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getEmployeeId(): number | null {
    const empIdStr = sessionStorage.getItem('employeeId');
    return empIdStr ? Number(empIdStr) : null;
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
    const token = sessionStorage.getItem('token');
    if (!token) throw new Error('Token not found');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const employeeId = this.getEmployeeId();
    const jsonBody = { employeeId: employeeId, ...this.getAllFormData() };

    return this.http.post(`${BASE_URL}/personal/savejson`, jsonBody, {
      headers,
    });
  }

  uploadDocuments(): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) throw new Error('Token not found');

    const employeeId = this.getEmployeeId();
    if (!employeeId) throw new Error('Employee ID missing in Session Storage');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(
      `${BASE_URL}/documents/upload/${employeeId}`,
      this.documentData,
      { headers }
    );
  }
}
