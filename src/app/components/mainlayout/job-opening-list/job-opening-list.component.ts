import { Component, OnInit } from '@angular/core';
import { MainLayoutService } from '../resignation/service/MainLayoutSevice';
import { MatDialog } from '@angular/material/dialog';
import { JobEditDialogComponent } from './job-edit-dialog/job-edit-dialog.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-job-opening-list',
  templateUrl: './job-opening-list.component.html',
  styleUrls: ['./job-opening-list.component.css']
})
export class JobOpeningListComponent implements OnInit {
  jobs: any[] = [];
  loading = true;

  showModal = false;
  selectedJob: any = null;
  editableJob: any = {};
  isAdmin = false;

  constructor(
    private mainLayoutService: MainLayoutService,
    private dialog: MatDialog,
    private authService: AuthService, 
  ) {}

  ngOnInit(): void {
    this.loadJobs();
    this.isAdmin = this.authService.isAdmin();
    console.log(this.isAdmin)
  }

  loadJobs(): void {
    this.mainLayoutService.getJobPosting().subscribe({
      next: res => {
        this.jobs = res;
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching jobs', err);
        this.loading = false;
      }
    });
  }

  editJob(job: any): void {
    const dialogRef = this.dialog.open(JobEditDialogComponent, {
      width: '500px',
      data: { job }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const idx = this.jobs.findIndex(j => j.id === result.id);
        if (idx !== -1) this.jobs[idx] = result;
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveJob(): void {
    this.mainLayoutService.updateJobPosting(this.editableJob)
      .subscribe({
        next: () => {
          // update local list
          const index = this.jobs.findIndex(j => j.id === this.editableJob.id);
          if (index !== -1) this.jobs[index] = { ...this.editableJob };
          this.showModal = false;
          alert('Job details updated successfully!');
        },
        error: err => {
          console.error('Error saving job', err);
          alert('Failed to save job details');
        }
      });
  }

  deleteJob(id: number): void {
    if (confirm('Are you sure you want to delete this job?')) {
      this.mainLayoutService.deleteJobPosting(id).subscribe({
        next: () => {
          this.jobs = this.jobs.filter(j => j.id !== id);
        },
        error: err => console.error('Error deleting job', err)
      });
    }
  }
  onQualificationChange(value: string): void {
    this.editableJob.qualifications = value.split(',').map(v => v.trim());
  }

  onSkillChange(value: string): void {
    this.editableJob.skills = value.split(',').map(v => v.trim());
  }

}
