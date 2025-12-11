import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  AttendanceRecord,
  AttendanceService,
} from "src/app/services/attendance.service";
import { AuthService } from "src/app/services/auth.service";
import { ChangeDetectorRef } from "@angular/core";
import { LeaveService } from "src/app/services/leave.service";

@Component({
  selector: "app-attendance",
  templateUrl: "./attendance.component.html",
  styleUrls: ["./attendance.component.css"],
})
export class AttendanceComponent implements OnInit {
  attendanceForm!: FormGroup;
  attendanceList: any[] = [];

  currentMonthIndex = new Date().getMonth();
  currentYear = new Date().getFullYear();
  isSubmitted = false;
  isOnLeave = false;
  isHoliday: boolean = false;

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private leaveService: LeaveService
  ) {}

  ngOnInit(): void {
    const empId = this.authService.getEmployeeId();
    const fullName = this.authService.getfullName();

    const currentTime = this.getCurrentTime();
    const currentDate = new Date();
    this.attendanceForm = this.fb.group({
      empId: [{ value: empId, disabled: true }, Validators.required],
      fullName: [{ value: fullName, disabled: true }, Validators.required],
      department: ["", Validators.required],
      date: [currentDate, Validators.required],
      entryTime: [currentTime, Validators.required],
      remarks: [""],
    });
    this.checkLeaveForToday();
    this.checkHolidayStatus();
  }

  getCurrentTime(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }

  checkLeaveForToday() {
    const empId = Number(this.authService.getEmployeeId());
    const today = new Date().toISOString().split("T")[0];

    this.leaveService.checkLeave(empId, today).subscribe({
      next: (isLeave) => {
        this.isOnLeave = isLeave.body;

        if (this.isOnLeave) {
          this.attendanceForm.disable();
        }
      },
      error: (err) => console.error("Leave check error:", err),
    });
  }

  checkHolidayStatus() {
    this.attendanceService.isTodayHoliday().subscribe({
      next: (res:any) => {
        this.isHoliday = res;

        if (this.isHoliday) {
          this.attendanceForm.disable();
        }
      },
      error: (err:any) => {
        console.error("Holiday check failed", err);
      },
    });
  }

  submitAttendance(): void {
    this.isSubmitted = true;
    if (this.attendanceForm.invalid) {
      alert("⚠️ Please fill in required fields");
      return;
    }

    const formValue = this.attendanceForm.getRawValue();

    const record: AttendanceRecord = {
      empId: Number(formValue.empId),
      name: formValue.fullName,
      department: formValue.department,
      date: formValue.date,
      entryTime: formValue.entryTime,
      remarks: formValue.remarks || "",
      isApproved: false,
    };

    this.attendanceService.submitAttendance(record).subscribe({
      next: () => {
        alert("✅ Attendance submitted");

        const empId = this.authService.getEmployeeId();
        const fullName = this.authService.getfullName();

        this.isSubmitted = false;

        this.attendanceForm.reset({
          empId: empId,
          fullName: fullName,
          department: null,
          date: new Date(),
          entryTime: this.getCurrentTime(),
          remarks: "",
        });

        this.attendanceForm.get("empId")?.disable();
        this.attendanceForm.get("fullName")?.disable();
        this.cdr.detectChanges();
        this.attendanceForm.get("department")?.markAsPristine();
        this.attendanceForm.get("department")?.markAsUntouched();
        this.attendanceForm.get("department")?.setErrors(null);
        this.cdr.detectChanges();
      },
      error: (err) => alert(err.error),
    });
  }

  get selectedMonthYear(): string {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
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
