import { Component, OnInit } from '@angular/core';
import { AttendanceRecord, AttendanceService } from 'src/app/services/attendance.service';

@Component({
  selector: 'app-admin-attendance',
  templateUrl: './admin-attendance.component.html',
  styleUrls: ['./admin-attendance.component.css']
})
export class AdminAttendanceComponent implements OnInit {
  allAttendance: AttendanceRecord[] = [];
  filteredAttendance: AttendanceRecord[] = [];

  filterDate = '';
  filterMonth = '';
  filterEmpId = '';
  filterName = '';

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.attendanceService.getAllAttendance().subscribe((data: AttendanceRecord[]) => {
      this.allAttendance = data;
      this.filteredAttendance = data;
    });
  }

  applyFilters() {
    this.filteredAttendance = this.allAttendance.filter(entry => {
      const matchDate = this.filterDate ? entry.date === this.filterDate : true;
      const matchMonth = this.filterMonth ? entry.date.startsWith(this.filterMonth) : true;
      const matchEmpId = this.filterEmpId ? entry.empId.toString().includes(this.filterEmpId) : true;
      const matchName = this.filterName ? entry.name.toLowerCase().includes(this.filterName.toLowerCase()) : true;
      return matchDate && matchMonth && matchEmpId && matchName;
    });
  }

  approveAttendance(entry: AttendanceRecord) {
    entry.isApproved = true;
    this.attendanceService.updateAttendance(entry);
  }

  rejectAttendance(entry: AttendanceRecord) {
    entry.isApproved = false;
    this.attendanceService.updateAttendance(entry);
  }
}
