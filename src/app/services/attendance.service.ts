import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient,HttpHeaders } from '@angular/common/http';


export interface User {
  employeeId: number;
  fullName: string;
  email: string;
  mobile: number;
  gender: string;
  aadhar: string;
  dob: string;
  status: boolean;
  roles: string[];
}

export interface AttendanceRecord {
  date: string;
  entryTime?: string | null;
  name: string;
  empId: number;
  remarks?: string;
  isApproved: boolean;
  department: string;
  designation: string;
 status?: 'Present' | 'Absent' | 'Holiday' | 'Pending' | 'No Status';

   user?: User | null;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
TEST_MODE = false; // Set to false when you have an API
  
  private baseUrl = 'http://localhost:8080/Attendance';
  private attendanceList$ = new BehaviorSubject<AttendanceRecord[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {
    
    //  this.loadAttendance();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No valid auth token found. Please log in again.');
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }


    private loadAttendance() {
    this.http.get<AttendanceRecord[]>(`${this.baseUrl}/all`, { headers: this.getAuthHeaders() })
      .subscribe(
        data => this.attendanceList$.next(data),
        error => console.error('Error loading attendance', error)
      );
  }

   

 getAllAttendance(): Observable<AttendanceRecord[]> {
 return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/all`, { headers: this.getAuthHeaders() });
 }


getAttendanceByEmployeeId(employeeId: number): Observable<AttendanceRecord[]> {
  return this.http.get<AttendanceRecord[]>(
    `${this.baseUrl}/employee/${employeeId}`,
    { headers: this.getAuthHeaders() }
  );
}


submitAttendance(record: AttendanceRecord): Observable<AttendanceRecord> {
  const token = this.authService.getToken();
  if (!token) {
    // throw an error instead of returning undefined
    throw new Error('No auth token. Please login again.');
  }

  
   const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.post<AttendanceRecord>(`${this.baseUrl}`, record, { headers });
}

  updateAttendance(record: AttendanceRecord) {
    this.http.put<AttendanceRecord>(
      `${this.baseUrl}/${record.empId}/${record.date}`,
      record,
      { headers: this.getAuthHeaders() }
    ).subscribe(
      () => this.loadAttendance(),
      error => console.error('Error updating attendance', error)
    );
  }
}


