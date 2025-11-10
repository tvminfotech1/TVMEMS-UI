import { Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { AttendanceService, AttendanceRecord } from 'src/app/services/attendance.service';
import { AuthService } from 'src/app/services/auth.service';
import { DateAdapter } from '@angular/material/core';
import { MatDialog} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-admin-attendance',
  templateUrl: './admin-attendance.component.html',
  styleUrls: ['./admin-attendance.component.css']
})
export class AdminAttendanceComponent implements OnInit {

  allAttendance: AttendanceRecord[] = [];
  employees: any[] = [];
  filterMonth = '';
  isAdmin = false;
  isUser = false;
  filterName = '';
 filterEmpId = '';
 filterDate = '';
 filteredAttendance: AttendanceRecord[] = [];
     years: number[] = []; // <-- Dropdown years
  today = new Date().toISOString().slice(0, 7); // yyyy-MM max limit for month picker

  selectedMonth = '';   // <-- For month input (yyyy-MM)
  selectedYear = new Date().getFullYear(); // <-- For year dropdown
  selectedEmployee: any = null;
  selectedMonthName = '';
  employeeAttendance: AttendanceRecord[] = [];

  adminDisplayedColumns: string[] = ['employeeId', 'fullName', 'department', 'designation', 'actions'];
userDisplayedColumns: string[] = ['date', 'entryTime', 'breakTime', 'workingTime', 'remarks'];


  @ViewChild('attendanceDialog') attendanceDialog!: TemplateRef<any>;

  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private dateAdapter: DateAdapter<Date>,
     private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log("🟢 AdminAttendanceComponent initialized");

    this.isUser = this.authService.isUser();
    this.isAdmin = this.authService.isAdmin();
      const currentMonth = new Date().toISOString().slice(0, 7);
     this.filterMonth = currentMonth; 

    if (this.isAdmin) {
      this.loadAllAttendance();
    }

    if (this.isUser) {
      this.loadUserAttendance();
    }
  }

  loadAllAttendance() {
    this.attendanceService.getAllAttendance().subscribe({
      next: (response: any) => {
        const data = response.body;
        console.log("✅ Attendance data:", data);
         const currentEmpIdStr = this.authService.getEmployeeId();
      const currentEmpId = currentEmpIdStr ? Number(currentEmpIdStr) : null;

         const filteredData = data.filter((att: any) => att.user?.employeeId !== currentEmpId);



         const map = new Map<number, any>();
        filteredData.forEach((att: any) => {
          const empId = att.user?.employeeId;
          if (empId && !map.has(empId)) {
            map.set(empId, {
              employeeId: att.user.employeeId,
              fullName: att.user.fullName,
              department: att.department,
              designation: att.designation
            });
          }
        });

        this.employees = Array.from(map.values());
        this.allAttendance = filteredData;
        this.filteredAttendance = this.employees;
      },
      error: (err) => console.error("❌ Error:", err)
    });
  }

convertToDateTime(timeString?: string | null): Date | null {
  // ⛔ No time or midnight (00:00:00) should not show 12 AM
  if (!timeString || timeString === '00:00:00' || timeString === '-') return null;

  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, seconds || 0);
  return date;
}


loadUserAttendance() {
  const empIdStr = this.authService.getEmployeeId();
  const empId = empIdStr ? Number(empIdStr) : null;

  if (empId !== null && !isNaN(empId)) {
    const selectedMonth = this.filterMonth || new Date().toISOString().slice(0, 7);
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    this.attendanceService.getAttendanceByEmployeeId(empId).subscribe({
      next: (data: any) => {
        console.log("✅ Raw User Attendance:", data);
        const attendanceList = Array.isArray(data) ? data : data.body;

        const today = new Date();
        const daysInMonth = new Date(year, month, 0).getDate();

        const monthAttendance: any[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
          // ✅ Use UTC to avoid timezone shift issues
          const currentDate = new Date(Date.UTC(year, month - 1, day));
          const formattedDate = currentDate.toISOString().split('T')[0];

          const record = attendanceList.find((a: any) => a.date === formattedDate);

          const isSunday = currentDate.getUTCDay() === 0;
          const isFutureDate = currentDate > today;

          let status = '-';
  if (isSunday) status = 'Holiday';
  else if (record) status = 'Present';
  else if (formattedDate === today.toISOString().split('T')[0]) status = 'Pending';
  else if (!isFutureDate) status = 'Absent';
  else status = 'No Status';
          monthAttendance.push({
            date: formattedDate,
           entryTime: record?.entryTime && record.entryTime !== '00:00:00' ? record.entryTime : '-',
            remarks: record?.remarks || '-',
            status,
          });
        }

        this.employeeAttendance = monthAttendance;
        console.log(`📅 Attendance (Month Start Fixed) for ${selectedMonth}:`, this.employeeAttendance);
      },
      error: (err) => console.error("❌ Error fetching user attendance:", err)
    });
  } else {
    console.error("❌ Invalid employee ID:", empIdStr);
  }
}




openDialog(empId?: number) {
  if (!empId) return;

  if (!this.filterMonth) {
    alert('Please select a month first!');
    return;
  }

  const [year, month] = this.filterMonth.split('-');
  const monthName = new Date(+year, +month - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  this.selectedEmployee = this.employees.find(e => e.employeeId === empId);
  this.selectedMonthName = monthName;

  // Get attendance from backend
  this.attendanceService.getAttendanceByEmployeeId(empId).subscribe({
    next: (data: any) => {
      const attendanceList = Array.isArray(data) ? data : data.body;

      const daysInMonth = new Date(+year, +month, 0).getDate();
      const today = new Date();

      const monthAttendance: any[] = [];

      // Loop through every date in that month
      for (let day = 1; day <= daysInMonth; day++) {
        // const currentDate = new Date(+year, +month - 1, day);
        const currentDate = new Date(Date.UTC(+year, +month - 1, day));
        const formattedDate = currentDate.toISOString().split('T')[0];

        // Check if attendance exists for that date
        const record = attendanceList.find(
          (a: any) => a.date === formattedDate
        );
  
         const isSunday = currentDate.getDay() === 0;
         const isFutureDate = currentDate > today;

  let status = '-';
  if (isSunday) status = 'Holiday';
  else if (record) status = 'Present';
  else if (formattedDate === today.toISOString().split('T')[0]) status = 'Pending';
  else if (!isFutureDate) status = 'Absent';
  else status = 'No Status';

        monthAttendance.push({
          date: formattedDate,
         entryTime: record?.entryTime && record.entryTime !== '00:00:00' ? record.entryTime : '-',
          remarks: record ? record.remarks || '-' : '-',
          status: status,
        });
      }
      

      this.employeeAttendance = monthAttendance;
      console.log('🟢 Final month attendance:', this.employeeAttendance);

      this.dialog.open(this.attendanceDialog, {
       width: '95%',
        maxWidth: '800px',
        disableClose: false, // allows closing by clicking outside
        panelClass: 'custom-dialog-container',
         autoFocus: false,
        position: { top: '', left: '' } // ✅ Ensures true centering

      });
    },
    error: (err) => console.error('❌ Error fetching employee attendance:', err),
  });
}


applyFilters(): void {
  if (this.isUser) {
    // 🔄 User case — reload data when month changes
    this.loadUserAttendance();
    return;
  }
  if (!this.filterEmpId && !this.filterName && !this.filterMonth) {
  this.filteredAttendance = [...this.employees];
  return;
}


  // 🔍 Admin case
  const empIdTerm = this.filterEmpId.trim().toLowerCase();
  const nameTerm = this.filterName.trim().toLowerCase();
  const monthTerm = this.filterMonth;

  this.filteredAttendance = this.employees.filter((emp: any) => {
    const matchesEmpId = !empIdTerm || emp.employeeId?.toString().toLowerCase().includes(empIdTerm);
    const matchesName = !nameTerm || emp.fullName?.toLowerCase().includes(nameTerm);

    // Optional month filter (if you want it to matter)
    const matchesMonth = !monthTerm || monthTerm === this.filterMonth;

    return matchesEmpId && matchesName && matchesMonth;
  });
}

}

