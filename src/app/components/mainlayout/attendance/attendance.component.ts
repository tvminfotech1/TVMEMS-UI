import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AttendanceRecord, AttendanceService } from 'src/app/services/attendance.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  public get attendanceService(): AttendanceService {
    return this._attendanceService;
  }
  public set attendanceService(value: AttendanceService) {
    this._attendanceService = value;
  }
  attendanceForm!: FormGroup;
  attendanceList: AttendanceRecord[] = [];

  currentMonthIndex = new Date().getMonth();
  currentYear = new Date().getFullYear();

  employee = {
    empId: 1001,
    name: 'Rohit Kumar',
    department: 'IT',
    designation: 'Frontend Developer'
  };

  constructor(private fb: FormBuilder, private _attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.attendanceForm = this.fb.group({
      empId: [this.employee.empId, [Validators.required]],
      name: [this.employee.name, Validators.required],
      department: [this.employee.department, Validators.required],
      designation: [this.employee.designation, Validators.required],
      date: [this.formatDate(new Date()), Validators.required],
      status: ['', Validators.required],
      remarks: [''],
      entryTime: ['09:30']
    });

    // Subscribe to shared service data
    this.attendanceService.getAllAttendance().subscribe((data: any[]) => {
      this.attendanceList = data.filter(
        r => r.empId === this.employee.empId
      );
    });
  }

  formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  submitAttendance(): void {
    if (this.attendanceForm.invalid) {
      alert('⚠️ Please fill in required fields');
      return;
    }

    const formValue = this.attendanceForm.value;
    const record: AttendanceRecord = {
      empId: Number(formValue.empId),
      name: formValue.name,
      department: formValue.department,
      designation: formValue.designation,
      date: formValue.date,
      entryTime: formValue.entryTime,
      status: formValue.status,
      remarks: formValue.remarks,
      isApproved: false
    };

    this.attendanceService.submitAttendance(record);
    alert('✅ Attendance submitted');

    this.attendanceForm.patchValue({ status: '', remarks: '', entryTime: '09:30' });
  }

  get selectedMonthYear(): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[this.currentMonthIndex]} ${this.currentYear}`;
  }

  goToPreviousMonth(): void {
    if (this.currentMonthIndex === 0) {
      this.currentMonthIndex = 11;
      this.currentYear--;
    } else {
      this.currentMonthIndex--;
    }
  }

  goToNextMonth(): void {
    if (this.currentMonthIndex === 11) {
      this.currentMonthIndex = 0;
      this.currentYear++;
    } else {
      this.currentMonthIndex++;
    }
  }
}
