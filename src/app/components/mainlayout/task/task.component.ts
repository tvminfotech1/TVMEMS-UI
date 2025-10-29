import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from './service/task.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  taskForm!: FormGroup;
  showPopup = false;
  filteredCards: any[] = [];
  cards: any[] = [];

  isAdmin = false;
  isUser = false;
  employeeId: string | null = null;
  fullName: string | null = null;
  

  searchText: string = '';

  startDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  endDate: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);


  viewMode: 'list' | 'grid' = 'list';
  dateRange: string = '';
  currentDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private authservice: AuthService
  ) { }

  ngOnInit(): void {

    this.isAdmin = this.authservice.isAdmin();
    this.isUser = this.authservice.isUser();
    this.employeeId = this.authservice.getEmployeeId();
    this.fullName = this.authservice.getfullName();

    if (this.isUser) this.initializeForm();

    this.loadTasks();
    this.updateDateRange();
  }

  initializeForm(): void {
    this.taskForm = this.fb.group({
      project: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      dueDate: ['', Validators.required],
      priority: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  openPopup(): void {
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
  }

  onOverlayClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('popup')) {
      this.closePopup();
    }
  }

  addTask() {
    if (this.taskForm.invalid) {
      console.log('Form is invalid');
      return;
    }
    if (this.taskForm.value.dueDate < this.taskForm.value.startDate) {
      alert('Due date cannot be earlier than start date.');
      return;
    }

    const today = new Date();
    const formattedDate = today.toISOString();


    const payload = {
      employeeId: this.employeeId,
      taskOwner: this.fullName,
      project: this.taskForm.value.project,
      taskName: this.taskForm.value.title,
      description: this.taskForm.value.description,
      assignedDate: this.taskForm.value.startDate,
      todayDate: formattedDate,
      dueDate: this.taskForm.value.dueDate,
      priority: this.taskForm.value.priority,
      status: this.taskForm.value.status
    };

    console.log('Submitting task:', payload);

    this.taskService.addTask(payload).subscribe({
      next: (res) => {

        console.log('Task added successfully:', res);
        this.closePopup();
        this.taskForm.reset({ priority: '', status: '' });
        this.loadTasks();
      },
      error: (err) => console.error('Error adding task:', err)
    });


  }

  setViewMode(mode: 'list' | 'grid') {
    this.viewMode = mode;
  }

  goToPreviousDate(): void {
    this.startDate = this.addMonths(this.startDate, -1);
    this.endDate = this.addMonths(this.endDate, -1);
    this.updateDateRange();
    this.filterTasksByDate();
  }

  goToNextDate(): void {
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

  updateDateRange(): void {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    const startStr = this.startDate.toLocaleDateString('en-US', options);
    const endStr = this.endDate.toLocaleDateString('en-US', options);
    this.dateRange = `${startStr} - ${endStr}`;
  }


  filterTasksByDate(): void {
    if (!this.startDate || !this.endDate) return;

    console.log('🔍 Filtering tasks for:', {
      currentMonth: new Date().getMonth() + 1,
      viewMonth: this.startDate.getMonth() + 1,
      startDate: this.startDate.toDateString(),
      endDate: this.endDate.toDateString(),
      totalTasks: this.cards.length
    });

    this.filteredCards = this.cards.filter(task => {
      if (!task.assignedDate) {
        return false;
      }

      const taskDate = new Date(task.assignedDate);

      const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
      const startDateOnly = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate());
      const endDateOnly = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate());


      const taskStart = new Date(task.assignedDate);
      const taskEnd = new Date(task.dueDate);

      const isInRange = taskStart <= endDateOnly && taskEnd >= startDateOnly;

      if (isInRange) {
        console.log('✅ Task included:', {
          title: task.title,
          assignedDate: taskDateOnly.toDateString(),
          month: taskDateOnly.getMonth() + 1
        });
      }

      return isInRange;
    });

    console.log(`📊 Results: ${this.filteredCards.length} tasks in current view`);
  }

  filterTasksBySearch(): void {
    const term = this.searchText.trim().toLowerCase();
    this.filteredCards = this.cards.filter(task =>
      (task.fullName ?? '').toLowerCase().includes(term) ||
      (task.project ?? '').toLowerCase().includes(term) ||
      (task.employeeId?.toLowerCase().includes(term))
    );
  }


  loadTasks(): void {
    const taskObservable = this.isAdmin
      ? this.taskService.getAllTasks()
      : this.taskService.getTasks();

    taskObservable.subscribe({
      next: (res) => {
        console.log("API response:", res);

        let tasksArray: any[] = [];

        if (Array.isArray(res)) {
          tasksArray = res;
        } else if (res && typeof res === 'object') {
          const possibleArray = Object.values(res).find(val => Array.isArray(val));
          tasksArray = Array.isArray(possibleArray) ? possibleArray : [];
        }

        this.cards = tasksArray.map(task => ({
          id: task.id,
          title: task.taskName || '',
          project: task.project || '',
          fullName: task.taskOwner || '',
          employeeId: task.employeeId ? task.employeeId.toString() : '',
          description: task.description || '',
          assignedDate: task.assignedDate ? new Date(task.assignedDate) : null,
          todayDate: task.todayDate,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          priority: task.priority || 'Low',
          status: task.status || 'Not Started'
        }));

        this.filteredCards = [...this.cards];

      },
      error: (err) => console.error(err)
    });
  }


  updateTask(task: any) {
    const payload = {
      taskName: task.title,
      project: task.project,
      taskOwner: task.fullName,
      employeeId: task.employeeId,
      description: task.description,
      assignedDate: task.assignedDate,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status
    };

    this.taskService.updateTask(task.id, payload).subscribe({
      next: (res) => {
        console.log('Task updated successfully', res);
        this.loadTasks();
      },

      error: (err) => console.error('Error updating task', err)
    });
  }


  deleteTask(taskId: any) {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    this.taskService.deleteTask(taskId).subscribe({
      next: (res) => {
        console.log('Task deleted successfully', res);

        this.cards = this.cards.filter(task => task.id !== taskId);
        this.filteredCards = this.filteredCards.filter(task => task.id !== taskId);

        if (this.searchText) this.filterTasksBySearch();
        this.filterTasksByDate();
        this.loadTasks();
      },
      error: (err) => console.error('Error deleting task', err)
    });
  }

}