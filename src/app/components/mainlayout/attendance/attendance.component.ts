import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  AttendanceRecord,
  AttendanceService,
} from 'src/app/services/attendance.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css'],
})
export class AttendanceComponent implements OnInit {
  attendanceForm!: FormGroup;
  attendanceList: any[] = [];

  currentMonthIndex = new Date().getMonth();
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const empId = this.authService.getEmployeeId();
    const fullName = this.authService.getfullName();

    const currentTime = this.getCurrentTime();
    const currentDate = new Date();

    this.attendanceForm = this.fb.group({
      empId: [{ value: empId, disabled: true }, Validators.required],
      fullName: [{ value: fullName, disabled: true }, Validators.required],
      department: ['', Validators.required],
      designation: ['', Validators.required],
      date: [currentDate, Validators.required],
      entryTime: [currentTime, Validators.required],
      remarks: [''],
    });
  }

  getCurrentTime(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }

  submitAttendance(): void {
    if (this.attendanceForm.invalid) {
      alert('⚠️ Please fill in required fields');
      return;
    }

    const formValue = this.attendanceForm.getRawValue();

    const record: AttendanceRecord = {
      empId: Number(formValue.empId),
      name: formValue.fullName,
      department: formValue.department,
      designation: formValue.designation,
      date: formValue.date,
      entryTime: formValue.entryTime,
      remarks: formValue.remarks || '',
      isApproved: false,
    };

    this.attendanceService.submitAttendance(record).subscribe({
      next: (res) => {
        alert('✅ Attendance submitted');
        this.attendanceForm.patchValue({
          remarks: '',
          entryTime: this.getCurrentTime(),
        });
      },
      error: (err) => console.error('Submit error', err),
    });
  }

  get selectedMonthYear(): string {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
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
