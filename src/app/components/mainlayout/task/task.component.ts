import { Component } from '@angular/core';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent {
  startDate = new Date(2025, 3, 4); // April 4, 2025
  endDate = new Date(2025, 7, 2);   // August 2, 2025
  dateRange = '';

  viewMode: 'list' | 'grid' = 'list';
  showForm = false;

  cards = [
    {
      label: 'Training',
      title: 'CloudSens Onboarding',
      description: 'Initial training session',
      startDate: '2025-04-04',
      dueDate: '2025-04-07',
      priority: 'Medium',
      status: 'Not Started'
    }
  ];

  filteredCards = [...this.cards];

  newTask: any = {
    label: '',
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
    priority: '',
    status: ''
  };

  constructor() {
    this.updateDateRange();
    this.filterTasksByDate();
  }

  updateDateRange() {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    const startStr = this.startDate.toLocaleDateString('en-US', options);
    const endStr = this.endDate.toLocaleDateString('en-US', options);
    this.dateRange = `${startStr} - ${endStr}`;
  }

  goToPreviousDate() {
    this.startDate = this.addMonths(this.startDate, -1);
    this.endDate = this.addMonths(this.endDate, -1);
    this.updateDateRange();
    this.filterTasksByDate();
  }

  goToNextDate() {
    this.startDate = this.addMonths(this.startDate, 1);
    this.endDate = this.addMonths(this.endDate, 1);
    this.updateDateRange();
    this.filterTasksByDate();
  }

  private addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  submitTask() {
    if (this.newTask.title && this.newTask.startDate && this.newTask.dueDate) {
      this.cards.push({ ...this.newTask });
      this.newTask = {
        label: '',
        title: '',
        description: '',
        startDate: '',
        dueDate: '',
        priority: '',
        status: ''
      };
      this.toggleForm();
      this.filterTasksByDate();
    }
  }

  setViewMode(mode: 'list' | 'grid') {
    this.viewMode = mode;
  }

  filterTasksByDate() {
    this.filteredCards = this.cards.filter(task => {
      const taskDate = new Date(task.startDate);
      return taskDate >= this.startDate && taskDate <= this.endDate;
    });
  }
}
