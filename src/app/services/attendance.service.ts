import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BASE_URL } from '../models/baseurl/constant';


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
  status?: "Present" | "Absent" | "Holiday" | "Pending" | "No Status";

  user?: User | null;
}
export interface Holiday {
  id: number;
  name: string;
  date: string;
  day_Name: string;
}


@Injectable({
  providedIn: "root",
})
export class AttendanceService {
  TEST_MODE = false;


  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error("No valid auth token found. Please log in again.");
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }


  getAllAttendance(): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${BASE_URL}/Attendance/allAttendance`, {
      headers: this.getAuthHeaders(),
    });
  }

  getAttendanceByEmployeeId(
    employeeId: number
  ): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(
      `${BASE_URL}/Attendance/employee/${employeeId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  submitAttendance(record: AttendanceRecord): Observable<AttendanceRecord> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error("No auth token. Please login again.");
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<AttendanceRecord>(`${BASE_URL}/Attendance`, record, {
      headers,
    });
  }

  isTodayHoliday(): Observable<boolean> {
    return this.http.get<boolean>(`${BASE_URL}/today`);
  }
getHolidayDates(): Observable<string[]> {
  return this.http.get<Holiday[]>(`${BASE_URL}/Holiday`, {
    headers: this.getAuthHeaders(),
  }).pipe(
    map((holidays: Holiday[]) =>
      holidays.map((h: Holiday) => h.date)
    )
  );
}




  // updateAttendance(record: AttendanceRecord) {
  //   this.http
  //     .put<AttendanceRecord>(
  //       `${this.baseUrl}/${record.empId}/${record.date}`,
  //       record,
  //       { headers: this.getAuthHeaders() }
  //     )
  //     .subscribe(

  //       (error) => console.error("Error updating attendance", error)
  //     );
  // }
}
