import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public formData: any = {};
  public formGroups: { [key: string]: FormGroup } = {}; 

  private readonly BASE_URL = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  setFormData(step: string, data: any) {
    this.formData[step] = data;
  }

  // getFormData(p0: string) {
  //   return this.formData;
  // }
  getFormData(key: string) {
  return this.formData[key];
}

  clearFormData() {
    this.formData = {};
    this.formGroups = {}; 
  }

 submitFinalData(finalFormData: FormData): Observable<any> {
  return this.http.post(`${this.BASE_URL}/personal`, finalFormData);
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

  // ✅ Save attendance to backend
  submitAttendance(data: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}/api/attendance`, data);
  }

  // ✅ Get attendance for employee by month & year
  getAttendance(empId: string, month: number, year: number): Observable<any[]> {
    // 👇 Use this if real backend exists:
    return this.http.get<any[]>(
      `${this.BASE_URL}/api/attendance/${empId}?month=${month}&year=${year}`
    );

    // 👇 OR use this static data fallback for testing:
   
    const staticData = [
      {
        date: `${year}-${String(month).padStart(2, '0')}-01`,
        status: 'P',
        remarks: 'WFH',
        isApproved: true
      },
      {
        date: `${year}-${String(month).padStart(2, '0')}-02`,
        status: 'A',
        remarks: 'Sick leave',
        isApproved: false
      },
      {
        date: `${year}-${String(month).padStart(2, '0')}-03`,
        status: 'L',
        remarks: 'Personal',
        isApproved: true
      }
    ];
    return of(staticData);
    
  }

  // 🔁 (Optional) Static employee info for form pre-fill
  // getFormData(key: string) {
  //   if (key === 'personal') {
  //     return {
  //       empId: 'EMP001',
  //       name: 'Rohit Kumar',
  //       department: 'IT',
  //       designation: 'Frontend Developer'
  //     };
  //   }
  //   return {};
  // }

//   getAllAttendance(): Observable<any[]> {
//   return this.http.get<any[]>(`${this.BASE_URL}/api/attendance/all`);
// }
getAllAttendance(): Observable<any[]> {
  const staticAdminData = [
    {
      id: 101,
      empId: 'EMP001',
      name: 'Rohit Kumar',
      department: 'IT',
      designation: 'Frontend Developer',
      date: '2025-07-01',
      entryTime : '9:30',
      status: 'P',
      remarks: 'Work from Home',
      isApproved: true
    },
    {
      id: 102,
      empId: 'EMP002',
      name: 'Anjali Singh',
      department: 'HR',
      designation: 'HR Executive',
      date: '2025-07-01',
      status: 'L',
      remarks: 'Family Function',
      isApproved: false
    },
    {
      id: 103,
      empId: 'EMP003',
      name: 'Vikash Yadav',
      department: 'Finance',
      designation: 'Accountant',
      date: '2025-07-01',
      status: 'A',
      remarks: 'No info',
      isApproved: false
    }
  ];

  return of(staticAdminData);
}


// Update a single attendance record
updateAttendance(attendance: any): Observable<any> {
  return this.http.put(`${this.BASE_URL}/api/attendance/${attendance.id}`, attendance);
}

}

