import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnnouncementService } from './announcement.service';
import { AuthService } from 'src/app/services/auth.service';

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
    private authservice: AuthService
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
    this.announcementForm.patchValue(announcement);
    this.showModal = true;
  }
  formatTimeToAmPm(time: string): string {
    if (!time) return '';
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }

  deleteAnnouncement(id: number) {
    if (confirm('Are you sure you want to delete this announcement?')) {
      this.announcementService
        .delete(id)
        .subscribe(() => this.loadAnnouncements());
    }
  }

  submitForm() {
    if (this.announcementForm.invalid) return;

    const data = this.announcementForm.value;

    if (this.isEditMode && this.selectedId) {
      this.announcementService.update(this.selectedId, data).subscribe(() => {
        this.loadAnnouncements();
        this.closeModal();
      });
    } else {
      this.announcementService.create(data).subscribe(() => {
        this.loadAnnouncements();
        this.closeModal();
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.announcementForm.reset();
  }
}
