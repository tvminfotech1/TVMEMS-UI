import { Component, OnInit } from '@angular/core';
import { UserService } from '../../user-service.service';

@Component({
  selector: 'app-admin-attendance',
  templateUrl: './admin-attendance.component.html',
  styleUrls: ['./admin-attendance.component.css']
})
export class AdminAttendanceComponent implements OnInit {
  allAttendance: any[] = [];
  filteredAttendance: any[] = [];

  filterDate: string = '';
  filterMonth: string = '';
  filterEmpId: string = '';
  filterName: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.fetchAllAttendance();
  }

  fetchAllAttendance() {
    this.userService.getAllAttendance().subscribe((data) => {
      this.allAttendance = data;
      this.filteredAttendance = data;
    });
  }

  applyFilters() {
    this.filteredAttendance = this.allAttendance.filter((entry) => {
      const matchDate = this.filterDate ? entry.date === this.filterDate : true;
      const matchMonth = this.filterMonth ? entry.date.startsWith(this.filterMonth) : true;
      const matchEmpId = this.filterEmpId ? entry.empId.includes(this.filterEmpId) : true;
      const matchName = this.filterName ? entry.name.toLowerCase().includes(this.filterName.toLowerCase()) : true;
      return matchDate && matchMonth && matchEmpId && matchName;
    });
  }

  approveAttendance(entry: any) {
    entry.isApproved = true;
    this.userService.updateAttendance(entry).subscribe(() => {
      alert('✅ Approved!');
    });
  }

  rejectAttendance(entry: any) {
    entry.isApproved = false;
    this.userService.updateAttendance(entry).subscribe(() => {
      alert('❌ Rejected!');
    });
  }
}
