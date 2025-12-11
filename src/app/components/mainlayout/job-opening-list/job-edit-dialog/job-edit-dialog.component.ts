
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MainLayoutService } from '../../resignation/service/MainLayoutSevice';
import { AlertService } from 'src/app/alert-service.service';

@Component({
  selector: 'app-job-edit-dialog',
  templateUrl: './job-edit-dialog.component.html',
  styleUrls: ['./job-edit-dialog.component.css'],
})
export class JobEditDialogComponent {
  editableJob: any;

  constructor(
    private dialogRef: MatDialogRef<JobEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mainLayoutService: MainLayoutService,
    private alertservice: AlertService
  ) {
    this.editableJob = { ...data.job };
  }

  onQualificationChange(value: string) {
    this.editableJob.qualifications = value.split(',').map((v) => v.trim());
  }

  onSkillChange(value: string) {
    this.editableJob.skills = value.split(',').map((v) => v.trim());
  }

  save() {
    this.mainLayoutService.updateJobPosting(this.editableJob).subscribe({
   next: () => {
      this.alertservice.showSuccess("Job updated successfully!");
      this.dialogRef.close(this.editableJob);
    },
    error: (err) => {
      console.error("Error updating job:", err);
      this.alertservice.showError("Save failed: " + (err?.error?.message || err.message || "Unknown error"));
    }
  });
  }

  close() {
    this.dialogRef.close();
  }
}
