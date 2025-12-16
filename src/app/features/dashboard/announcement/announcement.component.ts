import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnnouncementService } from './announcement.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { AlertService } from 'src/app/core/services/alert.service';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.css'],
})
export class AnnouncementComponent implements OnInit {
  announcements: any[] = [];
  showModal = false;
  isEditMode = false;
  selectedId: number | null = null;
  isAdmin = false;
  isUser = false;

  announcementForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private announcementService: AnnouncementService,
    private authservice: AuthService,
    private alertservice: AlertService
  ) {
    this.announcementForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      place: ['', Validators.required],
      description: [''],
    });
  }

  ngOnInit() {
    this.loadAnnouncements();
    this.isAdmin = this.authservice.isAdmin();
    this.isUser = this.authservice.isUser();
  }

  loadAnnouncements() {
    this.announcementService.getAll().subscribe({
      next: (data) => {
        this.announcements = data.map((a) => ({
          ...a,
          startTimeFormatted: this.formatTimeToAmPm(a.startTime),
          endTimeFormatted: this.formatTimeToAmPm(a.endTime),
        }));
      },
      error: (err) => console.error('Error loading announcements:', err),
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedId = null;
    this.announcementForm.reset();
    this.showModal = true;
  }

  openEditModal(announcement: any) {
  this.isEditMode = true;
  this.selectedId = announcement.id;
  const dateOnly = announcement.date.includes('T')
    ? announcement.date.split('T')[0]
    : announcement.date;
  this.announcementForm.patchValue({
    ...announcement,
    date: new Date(dateOnly)
  });
  this.showModal = true;
}
  formatTimeToAmPm(time: string): string {
    if (!time) return '';
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }
  

async deleteAnnouncement(id: number) {
  const result = await this.alertservice.showConfirm('Are you sure you want to delete this announcement?');

  if (result.isConfirmed) {
    this.announcementService.delete(id).subscribe({
      next: () => {
        this.alertservice.showSuccess('Announcement deleted successfully.');
        this.loadAnnouncements();
      },
      error: (err) => {
        console.error('Error deleting announcement:', err);
        this.alertservice.showError('Failed to delete announcement. Please try again.');
      }
    });
  }
}


submitForm() {
  if (this.announcementForm.invalid) return;

  const formValue = this.announcementForm.value;

  const dateObj = formValue.date; 
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const finalDate = `${yyyy}-${mm}-${dd}`;   

  const data = {
    ...formValue,
    date: finalDate  
  };

  if (this.isEditMode && this.selectedId) {
    this.announcementService.update(this.selectedId, data).subscribe({
      next: () => {
        this.loadAnnouncements();
        this.closeModal();
        this.alertservice.showSuccess('Announcement updated successfully!');
      },
      error: (err) => {
        console.error('Error updating announcement:', err);
        this.alertservice.showError('Failed to update announcement. Please try again.');
      }
    });
  } else {
    this.announcementService.create(data).subscribe({
      next: () => {
        this.loadAnnouncements();
        this.closeModal();
        this.alertservice.showSuccess('Announcement created successfully!');
      },
      error: (err) => {
        console.error('Error creating announcement:', err);
        this.alertservice.showError('Failed to create announcement. Please try again.');
      }
    });
  }
}


  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.announcementForm.reset();
  }
}
