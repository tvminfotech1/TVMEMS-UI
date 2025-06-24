import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public formData: any = {};
  public formGroups: { [key: string]: FormGroup } = {}; 

  private readonly BASE_URL = 'http://localhost:8081'; // Your backend port here

  constructor(private http: HttpClient) {}

  setFormData(step: string, data: any) {
    this.formData[step] = data;
  }

  getFormData(p0: string) {
    return this.formData;
  }

  clearFormData() {
    this.formData = {};
    this.formGroups = {}; 
  }

  submitFinalData(data: any): Observable<any> {
    const apiUrl = `${this.BASE_URL}/personal`; 
    return this.http.post(apiUrl, data);
  }

  setFormGroup(step: string, formGroup: FormGroup) {
    this.formGroups[step] = formGroup;
  }

  isAllFormsValid(): boolean {
    return Object.values(this.formGroups).every(group => group.valid);
  }

  getInvalidSteps(): string[] {
    return Object.keys(this.formGroups).filter(key => !this.formGroups[key].valid);
  }

  uploadDocuments(formData: FormData): Observable<any> {
    return this.http.post(`${this.BASE_URL}/api/upload-documents`, formData);
  }
}
