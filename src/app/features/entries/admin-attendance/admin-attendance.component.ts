import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  AttendanceService,
  AttendanceRecord,
} from 'src/app/core/services/attendance.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'src/app/core/services/alert.service';
@Component({
  selector: 'app-admin-attendance',
  templateUrl: './admin-attendance.component.html',
  styleUrls: ['./admin-attendance.component.css'],
})
export class AdminAttendanceComponent implements OnInit {
  allAttendance: AttendanceRecord[] = [];
  employees: any[] = [];
  holidayDates: string[] = [];
  filterMonth = '';
  isAdmin = false;
  isUser = false;
  filterName = '';
  filterEmpId = '';
  filterDate = '';
  filteredAttendance: AttendanceRecord[] = [];
  years: number[] = [];
  today = new Date().toISOString().slice(0, 7);

  selectedMonth = '';
  selectedYear = new Date().getFullYear();
  selectedEmployee: any = null;
  selectedMonthName = '';
  employeeAttendance: AttendanceRecord[] = [];

  adminDisplayedColumns: string[] = [
    'employeeId',
    'fullName',
    'department',
    'actions',
  ];
  userDisplayedColumns: string[] = [
    'date',
    'entryTime',
    'breakTime',
    'workingTime',
    'remarks',
  ];

  @ViewChild('attendanceDialog') attendanceDialog!: TemplateRef<any>;

  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private dialog: MatDialog,
    private alertservice: AlertService,
  ) {}

  ngOnInit(): void {
    this.isUser = this.authService.isUser();
    this.isAdmin = this.authService.isAdmin();
    const currentMonth = new Date().toISOString().slice(0, 7);
    this.filterMonth = currentMonth;
   this.attendanceService.getHolidayDates().subscribe({
  next: (dates) => {
    this.holidayDates = dates;
  },
  error: (err) => console.error(err),
});

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
        const currentEmpIdStr = this.authService.getEmployeeId();
        const currentEmpId = currentEmpIdStr ? Number(currentEmpIdStr) : null;

        const filteredData = data.filter(
          (att: any) => att.user?.employeeId !== currentEmpId
        );

        const map = new Map<number, any>();
        filteredData.forEach((att: any) => {
          const empId = att.user?.employeeId;
          if (empId && !map.has(empId)) {
            map.set(empId, {
              employeeId: att.user.employeeId,
              fullName: att.user.fullName,
              department: att.department,
            });
          }
        });

        this.employees = Array.from(map.values());
        this.allAttendance = filteredData;
        this.filteredAttendance = this.employees;
      },
      error: (err) => console.error('❌ Error:', err),
    });
  }

  convertToDateTime(timeString?: string | null): Date | null {
    if (!timeString || timeString === '00:00:00' || timeString === '-')
      return null;

    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, seconds || 0);
    return date;
  }

  loadUserAttendance() {
  const empIdStr = this.authService.getEmployeeId();
  const empId = empIdStr ? Number(empIdStr) : null;

  if (empId !== null && !isNaN(empId)) {
    const selectedMonth =
      this.filterMonth || new Date().toISOString().slice(0, 7);

    const [yearStr, monthStr] = selectedMonth.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    this.attendanceService.getAttendanceByEmployeeId(empId).subscribe({
      next: (data: any) => {
        const attendanceList = Array.isArray(data) ? data : data.body;

        const firstRecord = attendanceList[0];
        let joiningDateStr = "";
        if (firstRecord?.user?.joiningDate) {
          const jd = new Date(firstRecord.user.joiningDate);
          if (!isNaN(jd.getTime())) {
            joiningDateStr = jd.toISOString().split("T")[0];
          }
        }
        

        const today = new Date();
        const daysInMonth = new Date(year, month, 0).getDate();

        const monthAttendance: any[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
          const currentDate = new Date(Date.UTC(year, month - 1, day));
          const formattedDate = currentDate.toISOString().split("T")[0];

          if (joiningDateStr && formattedDate < joiningDateStr) continue;

          const record = attendanceList.find(
            (a: any) => a.date === formattedDate
          );

          const isSunday = currentDate.getUTCDay() === 0;
          const isFutureDate = currentDate > today;
          const isHoliday = this.holidayDates.includes(formattedDate);
          let status = "-";
         if (isHoliday) status = "Holiday";
         else if (isSunday) status = "Holiday";
          else if (record) status = "Present";
          else if (formattedDate === today.toISOString().split("T")[0])
            status = "Pending";
          else if (!isFutureDate) status = "Absent";
          else status = "No Status";

          monthAttendance.push({
            date: formattedDate,
            entryTime:
              record?.entryTime && record.entryTime !== "00:00:00"
                ? record.entryTime
                : "-",
            remarks: record?.remarks || "-",
            status,
          });
        }

        this.employeeAttendance = monthAttendance;
      },
      error: (err) => console.error("❌ Error fetching user attendance:", err),
    });
  } else {
    console.error("❌ Invalid employee ID:", empIdStr);
  }
}


  openDialog(empId?: number) {
    if (!empId) return;

    if (!this.filterMonth) {
      this.alertservice.showInfo('Please select a month first!');
      return;
    }

    const [year, month] = this.filterMonth.split('-');
    const monthName = new Date(+year, +month - 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });

    this.selectedEmployee = this.employees.find((e) => e.employeeId === empId);
    this.selectedMonthName = monthName;
  
    this.attendanceService.getAttendanceByEmployeeId(empId).subscribe({
      next: (data: any) => {
        const attendanceList = Array.isArray(data) ? data : data.body;
        const firstRecord = attendanceList[0];
let joiningDateStr = "";

if (firstRecord?.user?.joiningDate) {
  const jd = new Date(firstRecord.user.joiningDate);
  if (!isNaN(jd.getTime())) {
    joiningDateStr = jd.toISOString().split("T")[0];
  }
}
if (this.isBeforeJoining(this.filterMonth, joiningDateStr)) {
  this.employeeAttendance = []; 

  this.dialog.open(this.attendanceDialog, {
    width: "95%",
    maxWidth: "800px",
    disableClose: false,
    panelClass: "custom-dialog-container",
    autoFocus: false
  });
  return;
}




        const daysInMonth = new Date(+year, +month, 0).getDate();
        const today = new Date();

        const monthAttendance: any[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
         const currentDate = new Date(+year, +month - 1, day);
 const currentDateStr =
    `${year}-${month}-${String(day).padStart(2, "0")}`;

if (joiningDateStr && currentDateStr < joiningDateStr) continue;

const formattedDate = currentDateStr;



          const record = attendanceList.find(
            (a: any) => a.date === formattedDate
          );

          const isSunday = currentDate.getDay() === 0;
          const isFutureDate = currentDate > today;
          const isHoliday = this.holidayDates.includes(formattedDate);
           let status = '-';
         if (isHoliday) status = "Holiday";
          else if (isSunday) status = "Holiday";
          else if (record) status = 'Present';
          else if (formattedDate === today.toISOString().split('T')[0])
            status = 'Pending';
          else if (!isFutureDate) status = 'Absent';
          else status = 'No Status';

          monthAttendance.push({
            date: formattedDate,
            entryTime:
              record?.entryTime && record.entryTime !== '00:00:00'
                ? record.entryTime
                : '-',
            remarks: record ? record.remarks || '-' : '-',
            status: status,
          });
        }

        this.employeeAttendance = monthAttendance;
        this.dialog.open(this.attendanceDialog, {
          width: '95%',
          maxWidth: '800px',
          disableClose: false,
          panelClass: 'custom-dialog-container',
          autoFocus: false,
          position: { top: '', left: '' },
        });
      },
      error: (err) =>
        console.error('❌ Error fetching employee attendance:', err),
    });
  }
  closedialog(){
    this.dialog.closeAll();

  }
  isBeforeJoining(selectedMonth: string, joiningDateStr: string): boolean {
  if (!joiningDateStr) return false;

  const [selYear, selMonth] = selectedMonth.split("-").map(Number);
  const [joinYear, joinMonth] = joiningDateStr.split("-").map(Number);

  if (selYear < joinYear) return true;

  if (selYear === joinYear && selMonth < joinMonth) return true;

  return false;
}

  applyFilters(): void {
    if (this.isUser) {
      this.loadUserAttendance();
      return;
    }
    if (!this.filterEmpId && !this.filterName && !this.filterMonth) {
      this.filteredAttendance = [...this.employees];
      return;
    }

    const empIdTerm = this.filterEmpId.trim().toLowerCase();
    const nameTerm = this.filterName.trim().toLowerCase();
    const monthTerm = this.filterMonth;

    this.filteredAttendance = this.employees.filter((emp: any) => {
      const matchesEmpId =
        !empIdTerm ||
        emp.employeeId?.toString().toLowerCase().includes(empIdTerm);
      const matchesName =
        !nameTerm || emp.fullName?.toLowerCase().includes(nameTerm);

      const matchesMonth = !monthTerm || monthTerm === this.filterMonth;

      return matchesEmpId && matchesName && matchesMonth;
    });
  }
}
