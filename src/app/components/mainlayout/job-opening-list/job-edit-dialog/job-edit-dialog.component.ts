import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MainLayoutService } from '../../resignation/service/MainLayoutSevice';

@Component({
  selector: 'app-job-edit-dialog',
  templateUrl: './job-edit-dialog.component.html',
  styleUrls: ['./job-edit-dialog.component.css']
})
export class JobEditDialogComponent {
editableJob: any;

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<JobEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mainLayoutService: MainLayoutService, 
  ) {
    this.editableJob = { ...data.job };
  }

  onQualificationChange(value: string) {
    this.editableJob.qualifications = value.split(',').map(v => v.trim());
  }

  onSkillChange(value: string) {
    this.editableJob.skills = value.split(',').map(v => v.trim());
  }

  save() {
    this.mainLayoutService.updateJobPosting(this.editableJob)
      .subscribe({
        next: () => this.dialogRef.close(this.editableJob),
        error: err => alert('Save failed: ' + err.message)
      });
  }

  close() {
    this.dialogRef.close();
  }
}
