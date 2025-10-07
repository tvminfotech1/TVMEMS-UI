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

  uploadKycDocuments(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
    });
    return this.http.post(`${this.BASE_URL}/documentsupload`, formData, {
      headers,
    });
  }

  downloadKycDocument(
    documentType: string,
    documentId: number
  ): Observable<Blob> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
    });
    const url = `${this.BASE_URL}/documents/kycdocument/${documentType}/${documentId}`;
    return this.http.get(url, { headers, responseType: 'blob' });
  }

  submitFinalData(finalFormData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
    });

    return this.http.post(`${this.BASE_URL}/final/submit`, finalFormData, {
      headers,
    });
  }

  private formData: Record<string, any> = {};
  private formGroups: Record<string, FormGroup> = {};

  setFormData(step: string, data: any): void {
    this.formData[step] = data;
  }

  getFormData(key: string): any {
    return this.formData[key];
  }

  clearFormData(): void {
    this.formData = {};
    this.formGroups = {};
  }

  setFormGroup(step: string, formGroup: FormGroup): void {
    this.formGroups[step] = formGroup;
  }

  isAllFormsValid(): boolean {
    return Object.values(this.formGroups).every((g) => g.valid);
  }

  getInvalidSteps(): string[] {
    return Object.keys(this.formGroups).filter(
      (k) => !this.formGroups[k].valid
    );
  }

  private maritalStatusSubject = new BehaviorSubject<string>('');
  maritalStatus$ = this.maritalStatusSubject.asObservable();

  setMaritalStatus(status: string): void {
    this.maritalStatusSubject.next(status);
  }
}
