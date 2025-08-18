import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


export interface AttendanceRecord {
  date: string;
  entryTime?: string | null;
  name: string;
  empId: number;
  status: 'P' | 'A' | 'L' | 'H';
  remarks?: string;
  isApproved: boolean;
  department: string;
  designation: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
TEST_MODE = true; // Set to false when you have an API

  private attendanceList$ = new BehaviorSubject<AttendanceRecord[]>([]);

  constructor() {
    if (this.TEST_MODE) {
      // Initialize with some mock data for testing
      this.attendanceList$.next([
        {
          date: '2025-08-01',
          empId: 1001,
          name: 'Rohit Kumar',
          department: 'IT',
          designation: 'Frontend Developer',
          status: 'P',
          entryTime: '09:25',
          remarks: 'Work from Home',
          isApproved: true
        },
        {
          date: '2025-08-02',
          empId: 1001,
          name: 'Rohit Kumar',
          department: 'IT',
          designation: 'Frontend Developer',
          status: 'A',
          entryTime: null,
          remarks: 'Sick Leave',
          isApproved: false
        }
      ]);
    }
  }

  getAllAttendance(): Observable<AttendanceRecord[]> {
    return this.attendanceList$.asObservable();
  }

  submitAttendance(record: AttendanceRecord) {
    if (this.TEST_MODE) {
      const updatedList = [...this.attendanceList$.value, record];
      this.attendanceList$.next(updatedList);
      return;
    }
    // Implement API POST call here
  }

  updateAttendance(record: AttendanceRecord) {
    if (this.TEST_MODE) {
      const updatedList = this.attendanceList$.value.map(r =>
        r.empId === record.empId && r.date === record.date ? record : r
      );
      this.attendanceList$.next(updatedList);
      return;
    }
    // Implement API PUT call here
  }
}