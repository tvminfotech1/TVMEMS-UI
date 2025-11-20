import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";
import { WorkFromHomeService } from "src/app/services/work-from-home.service";
import { AuthService } from "src/app/services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";

export const dateRangeValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const fromDateValue = control.get("fromDate")?.value;
  const toDateValue = control.get("toDate")?.value;

  if (!fromDateValue || !toDateValue) return null;

  const fromDate = new Date(fromDateValue);
  const toDate = new Date(toDateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (fromDate < today) {
    return { fromDatePast: true };
  }

  if (toDate < today) {
    return { toDatePast: true };
  }

  return null;
};

@Component({
  selector: "app-wfh-apply-form",
  templateUrl: "./wfh-apply-form.component.html",
  styleUrls: ["./wfh-apply-form.component.css"],
})
export class WfhApplyFormComponent implements OnInit {
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCancelled = new EventEmitter<void>();

  wfhForm: FormGroup;
  employeeEmail: string = "Unknown Employee";
  employeeName: string = "Unknown Employee";
  employeeId: string = "Unknown Employee";
  submissionError: string | null = null;
  today: Date = new Date();
  disabledDates: string[] = [];
  wfhList: any[] = [];


  approvedWfhRanges: { start: Date; end: Date }[] = [];


  constructor(
    private fb: FormBuilder,
    private wfhService: WorkFromHomeService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.wfhForm = this.fb.group(
      {
        fromDate: ["", Validators.required],
        toDate: ["", Validators.required],
        reason: [
          "",
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(30),
          ],
        ],
        approver: [
          "",
          [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)],
        ],
      },
      {
        validators: [dateRangeValidator, this.toBeforeFromValidator],
      }
    );
  }

  formatDate(date: Date): string {
    return date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0');
  }

  ngOnInit(): void {
    this.employeeEmail = this.authService.getEmailFromToken() || "Employee email";
    this.employeeId = this.authService.getEmployeeId() || "Employee Id";
    this.employeeName = this.authService.getfullName() || "Employee Name";
    this.disabledDates = [];
    this.approvedWfhRanges = [];
       this.wfhService.getHolidays().subscribe(holidays => {
        holidays.forEach((holiday: any) => {
          if (!holiday.date) return;
          const dateObj = new Date(holiday.date);
          if (isNaN(dateObj.getTime())) return;
          const formatted = this.formatDate(dateObj);
          this.disabledDates.push(formatted);
        });

        this.disabledDates = Array.from(new Set(this.disabledDates));
      });

    this.wfhService.getApp_Pen_EmployeeWfh(Number(this.employeeId)).subscribe(data => {
    this.wfhList = data;
      this.approvedWfhRanges = data.map((item: any) => ({
        start: new Date(item.fromDate),
        end: new Date(item.toDate),
      }));

      data.forEach((item: any) => {
        const start = new Date(item.fromDate);
        const end = new Date(item.toDate);
        let current = new Date(start);
        while (current <= end) {
          const formatted = this.formatDate(current);
          this.disabledDates.push(formatted);
          current.setDate(current.getDate() + 1);
        }
      });

       });
  }

  disableDates = (date: Date | null): boolean => {
    if (!date) return true;
    const formatted = this.formatDate(date);
    const isDisabledDate = this.disabledDates.includes(formatted);
    const isSunday = date.getDay() === 0;
    return !(isDisabledDate || isSunday);
  };

  private normalize = (d: Date) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  disableToDate = (date: Date | null): boolean => {
    if (!date) return false;
    const fromValue = this.wfhForm.get('fromDate')?.value;
    if (!fromValue) return false;
    const fromDate = this.normalize(new Date(fromValue));
    const checkDate = this.normalize(new Date(date));
    if (checkDate < fromDate) return false;
    if (checkDate.getDay() === 0) {
      return false;
    }
    const candidates: Date[] = [];
    this.disabledDates.forEach(dStr => {
      const d = new Date(dStr);
      if (!isNaN(d.getTime())) {
        const nd = this.normalize(d);
        if (nd >= fromDate) candidates.push(nd);
      }
    });
    this.approvedWfhRanges.forEach(range => {
      const rangeStart = this.normalize(new Date(range.start));
      const rangeEnd = this.normalize(new Date(range.end));
      if (rangeEnd >= fromDate) {
        const firstBlocked = rangeStart < fromDate ? fromDate : rangeStart;
        candidates.push(this.normalize(firstBlocked));
      }
    });
    if (candidates.length === 0) {
      return true;
    }
    let firstDisabled = candidates[0];
    for (let i = 1; i < candidates.length; i++) {
      if (candidates[i] < firstDisabled) firstDisabled = candidates[i];
    }
    if (checkDate >= firstDisabled) return false;
    return true;
  };

  onSubmit() {
    this.submissionError = null;
    if (this.wfhForm.valid) {
      const formValue = this.wfhForm.value;
      const toServerDate = (d: Date | string | null) => {
        if (!d) return null;
        const dt = new Date(d);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const day = String(dt.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };
      const payload = {
        employeeEmail: this.employeeEmail,
        employeeId: this.employeeId,
        employeeName: this.employeeName,
        fromDate: toServerDate(this.wfhForm.get("fromDate")?.value),
        toDate: toServerDate(this.wfhForm.get("toDate")?.value),
        reason: formValue.reason,
        approver: formValue.approver,
        status: "pending",
        action: "N/A",
      };
      this.wfhService.createWfhRequest(payload).subscribe({
        next: (response) => {
          this.wfhForm.reset();

          this.formSubmitted.emit(response);
          this.showSnackBar(
            "WFH request submitted successfully!",
            "success-snackbar"
          );
        },
        error: (error) => {
          console.error("Error submitting WFH Request:", error);
        },
      });
    } else {
      this.wfhForm.markAllAsTouched();
      this.showSnackBar(
        "Please fill all required fields correctly.",
        "error-snackbar"
      );
    }
  }

  onCancel(): void {
    this.formCancelled.emit();
    this.showSnackBar("WFH request cancelled.", "error-snackbar");
  }

  blockApproverInput(event: KeyboardEvent) {
    const allowedKeys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Backspace",
      "Delete",
      "Tab",
    ];
    const pattern = /^[A-Za-z ]$/;

    const input = event.target as HTMLInputElement;
    const key = event.key;

    if (allowedKeys.includes(key)) {
      return;
    }

    if (!pattern.test(key)) {
      event.preventDefault();
      return;
    }

    if (input.value.length >= 20) {
      event.preventDefault();
    }
  }

  onOverlayClick(_event: MouseEvent) {
    this.onCancel();
  }

  private showSnackBar(message: string, panelClass: string) {
    this.snackBar.open(message, "Close", {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "top",
      panelClass: [panelClass],
    });
  }
  toBeforeFromValidator(group: FormGroup) {
    const from = group.get("fromDate")?.value;
    const to = group.get("toDate")?.value;

    if (from && to && to < from) {
      group.get("toDate")?.setErrors({ toBeforeFrom: true });
    } else {
      const errors = group.get("toDate")?.errors;
      if (errors) {
        delete errors["toBeforeFrom"];
        if (!Object.keys(errors).length) {
          group.get("toDate")?.setErrors(null);
        }
      }
    }

    return null;
  }
}