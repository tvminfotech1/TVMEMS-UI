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

  /* uploadKycDocuments(formData: FormData): Observable<any> {
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
  } */

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
  getAllFormData(): Record<string, any> {
    return this.formData;
  }

  setFormGroup(step: string, formGroup: FormGroup): void {
    this.formGroups[step] = formGroup;
  }

  isAllFormsValid(): boolean {
    console.log("this is formGroupsAAAAA",this.formGroups);
    return Object.keys(this.formGroups)
      .filter((step) => !this.optionalSteps.includes(step))
      .every((step) => this.formGroups[step].valid);
  }

  getInvalidSteps(): string[] {
    console.log("this is formGroupsBBBBB",this.formGroups);
    return Object.keys(this.formGroups)
      .filter((step) => !this.optionalSteps.includes(step))
      .filter((step) => !this.formGroups[step].valid);
  }

  private maritalStatusSubject = new BehaviorSubject<string>('');
  maritalStatus$ = this.maritalStatusSubject.asObservable();

  setMaritalStatus(status: string): void {
    this.maritalStatusSubject.next(status);
  }
  private optionalSteps: string[] = ['previousEmployee', 'skills', 'certification'];

  submitAllForms(): FormData {
    const allData = this.formData;
    const formData = new FormData();

    Object.keys(allData).forEach((step) => {
      const stepData = allData[step];

      if (step === 'documents') {
        Object.keys(stepData).forEach((fileKey) => {
          const file = stepData[fileKey];
          if (file instanceof File) {
            formData.append(fileKey, file, file.name);
          }
        });
      } else {
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
    const formData = this.submitAllForms();
    
    console.log('Final FormData being submitted:', formData);
    return this.http.post(`${this.BASE_URL}/finalForm`, formData, {
      headers,
    });
  }
}
