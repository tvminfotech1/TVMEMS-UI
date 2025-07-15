import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../user-service.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  attendanceForm!: FormGroup;
  attendanceList: any[] = [];
  currentMonthIndex = new Date().getMonth();
  currentYear = new Date().getFullYear();
  employee: any = {};

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.employee = this.userService.getFormData('personal') || {
      empId: '1001',
      name: 'Rohit Kumar',
      department: 'IT',
      designation: 'Frontend Developer'
    };

    this.attendanceForm = this.fb.group({
        empId: [this.employee.empId || 1001, [Validators.required, Validators.pattern(/^\d+$/)]],
      name: [this.employee.name, Validators.required],
      department: [this.employee.department, Validators.required],
      designation: [this.employee.designation, Validators.required],
      date: [this.formatDate(new Date()), Validators.required],
      status: ['', Validators.required],
      remarks: [''],
      entryTime: [''] 
    });

    this.fetchMonthlyAttendance();
  }

  formatDate(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
  }

  submitAttendance() {
  if (this.attendanceForm.valid) {
    const formValue = this.attendanceForm.value;
    const data = {
      ...formValue,
      empId: Number(formValue.empId),  // 👈 string to number conversion
      isApproved: false
    };

    console.log("✅ Final Submitted Data:", data); // 👀 Verify in console

    this.userService.submitAttendance(data).subscribe({
      next: () => {
        alert('✅ Attendance submitted');
        this.attendanceForm.patchValue({
          status: '',
          remarks: '',
          entryTime: '09:30'
        });
        this.fetchMonthlyAttendance();
      },
      error: () => alert('❌ Failed')
    });
  } else {
    console.warn("⚠️ Form is invalid.");
  }
}


  fetchMonthlyAttendance() {
    const month = this.currentMonthIndex + 1;
    const year = this.currentYear;
    const empId = this.employee.empId;

    // ✅ Static test data to show in table (without API call)
    this.attendanceList = [
  {
    date: `${year}-${String(month).padStart(2, '0')}-01`,
    name: this.employee.name,
    status: 'P',
    remarks: 'Work from Home',
    isApproved: true
  },
  {
    date: `${year}-${String(month).padStart(2, '0')}-02`,
    name: this.employee.name,
    status: 'A',
    remarks: 'Sick Leave',
    isApproved: false
  },
  {
    date: `${year}-${String(month).padStart(2, '0')}-03`,
    name: this.employee.name,
    status: 'L',
    remarks: 'Personal Reason',
    isApproved: true
  }
];

  }

  get selectedMonthYear(): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[this.currentMonthIndex]} ${this.currentYear}`;
  }

  goToPreviousMonth() {
    if (this.currentMonthIndex === 0) {
      this.currentMonthIndex = 11;
      this.currentYear--;
    } else {
      this.currentMonthIndex--;
    }
    this.fetchMonthlyAttendance();
  }

  goToNextMonth() {
    if (this.currentMonthIndex === 11) {
      this.currentMonthIndex = 0;
      this.currentYear++;
    } else {
      this.currentMonthIndex++;
    }
    this.fetchMonthlyAttendance();
  }
}
