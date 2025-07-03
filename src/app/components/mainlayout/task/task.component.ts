import { Component } from '@angular/core';
import { TaskService } from './service/task.service';

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

  cards: any[] = [];
  filteredCards: any[] = [];

  newTask: any = {
    employeeName: '',
    label: '',
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
    priority: '',
    status: ''
  };

  constructor(private taskService: TaskService) {
    this.updateDateRange();
    this.loadTasks(); 
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
      this.taskService.addTask(this.newTask).subscribe({
        next: () => {
          this.loadTasks(); // ⬅️ Refresh tasks after adding
          this.newTask = {
            employeeName: '',
            label: '',
            title: '',
            description: '',
            startDate: '',
            dueDate: '',
            priority: '',
            status: ''
          };
          this.toggleForm();
        },
        error: (err) => {
          console.error('Failed to add task:', err);
        }
      });
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

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks: any[]) => {
        this.cards = tasks;
        this.filterTasksByDate();
      },
      error: (err) => {
        console.error('Failed to load tasks:', err);
      }
    });
  }
}
