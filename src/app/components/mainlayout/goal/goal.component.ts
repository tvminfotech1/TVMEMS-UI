import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "src/app/services/auth.service";
import { GoalService } from "./goal.service";
import { UserlistService } from "src/app/services/admin.service";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-goal",
  templateUrl: "./goal.component.html",
  styleUrls: ["./goal.component.css"],
})
export class GoalComponent implements OnInit {
  isAdmin = false;
  isUser = true;
  employeeId: string | null = null;
  fullName: string | null = null;
  previousDueDate: any = null;
  currentView: "main" | "goalType" | "newGoal" | "archived" = "main";
  isTableVisible: boolean = true;
  searchText: string = "";
  allGoals: any[] = [];
  goalList: any[] = [];
  public employees: any[] = [];
  public filteredEmployees: any[] = [];
  completedGoals: any[] = [];
  goalForm!: FormGroup;
  archivedGoals: any[] = [];
  selectedGoal: any;
  displayedColumns = [
    "category",
    "description",
    "weight",
    "startDate",
    "dueDate",
    "progress",
    "action",
  ];
  goalData: any[] = [];
  showHistoryMap = false;
  months: string[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  private currentUserEmail: string | null = null;
  goals: any[] = [];
  selectedMonth: string | null = null;
  selectedMonthGoals: any[] = [];
  currentYear: number = new Date().getFullYear();
  monthPoints: { x: number; y: number }[] = [];
  selectedYear: number = this.currentYear;
  filteredGoals: any[] = [];
  showGoalPopup: boolean = false;
  goalListForPopup: any[] = [];
  readonly radius = 54;
  readonly circumference: number = 2 * Math.PI * this.radius;
  currentDate: Date = new Date();
  dateRange: string = "";
  currentPage = 1;
  itemsPerPage = 5;
  joiningDate: Date | null = null;
  selectedDate: Date = new Date();
  joiningMonth!: number;
  joiningYear!: number;
  requireDueDate: boolean = false;
  pendingDueGoal: any = null;
  previousStartDate: string | null = null;
  goalBackup: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userlistService: UserlistService,
    private goalService: GoalService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isUser = this.authService.isUser();
    this.employeeId = this.authService.getEmployeeId();
    this.fullName = this.authService.getfullName();
    this.currentUserEmail = this.authService.getUserEmail?.();

    this.goalForm = this.fb.group({
      category: ["", Validators.required],
      description: ["", [Validators.required, Validators.maxLength(35)]],
      weight: [
        "",
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
    });
    if (this.isUser) {
      this.goalService.getGoalByUserid(Number(this.employeeId)).subscribe({
        next: (res) => {
          const first = res.body?.[0];
          if (first && first.user && first.user.joiningDate) {
            this.joiningDate = new Date(first.user.joiningDate);
            this.joiningMonth = this.joiningDate.getMonth();
            this.loadArchivedGoals();
            this.filterEmployeesByGoalMonth();
          }
        },
        error: (err) => {
          console.error("Failed to fetch joining date", err);
        },
      });
    }
    if (this.isAdmin) {
      this.allUser();
      this.updateDateRangeLabel();
    }
  }

  fetchGoals() {
    this.goalService.getGoals().subscribe((data) => {
      this.goalList = data;
      this.filterGoalsByYear();
    });
  }

  filterGoalsByYear() {
    this.filteredGoals = this.goalList.filter((goal: any) => {
      return new Date(goal.startDate).getFullYear() === this.selectedYear;
    });
  }

  previousYear() {
    if (this.selectedYear > this.joiningYear) {
      this.selectedYear--;
      this.filterGoalsByYear();
      if (
        this.selectedYear === this.joiningYear &&
        this.selectedDate.getMonth() < this.joiningMonth
      ) {
        this.selectedDate.setMonth(this.joiningMonth);
      }
    }
  }

  nextYear() {
    if (this.selectedYear < this.currentYear) {
      this.selectedYear++;
      this.filterGoalsByYear();
    }
  }

  isNextDisabled(): boolean {
    return this.selectedYear === this.currentYear;
  }

  isPreviousDisabled(): boolean {
    return this.selectedYear === this.joiningYear;
  }

  isMonthSelectable(index: number): boolean {
    if (!this.joiningDate) return true;

    const month = index;
    const year = this.selectedYear;

    if (year === this.joiningYear) {
      return month >= this.joiningMonth;
    }

    if (year > this.joiningYear && year <= this.currentYear) {
      return true;
    }

    return false;
  }

  getPosition(index: number) {
    const total = 12;
    const angle = (index / total) * 2 * Math.PI;
    const radius = 170;
    const x = radius * Math.cos(angle - Math.PI / 2);
    const y = radius * Math.sin(angle - Math.PI / 2);

    return {
      left: `calc(50% + ${x}px - 32.5px)`,
      top: `calc(50% + ${y}px - 32.5px)`,
    };
  }

  allUser(): void {
    this.userlistService.getAllUser().subscribe({
      next: (response) => {
        const allUsers = response.body || [];

        this.employees = allUsers.filter(
          (user: any) =>
            user.role?.toLowerCase() !== "admin" &&
            user.email?.toLowerCase() !== this.currentUserEmail?.toLowerCase()
        );
        this.filterEmployeesByGoalMonth();
      },
      error: (err) => {
        console.error(" Error fetching users", err);
        this.employees = [];
        this.filteredEmployees = [];
      },
    });
  }

  onSearch(): void {
    const term = this.searchText.trim().toLowerCase();
    if (!term) {
      this.filterEmployeesByGoalMonth();
      return;
    }
    this.filteredEmployees = this.filteredEmployees.filter(
      (emp) =>
        emp.employeeId?.toString().toLowerCase().includes(term) ||
        emp.fullName?.toLowerCase().includes(term)
    );
  }

  goToGoalType(): void {
    this.currentView = "goalType";
  }

  move(goalType: string): void {
    if (goalType === "personal") {
      this.currentView = "newGoal";
    } else if (goalType === "archived") {
      this.currentView = "archived";
      this.loadArchivedGoals();
    }
  }

  goClose(): void {
    this.currentView = this.currentView === "newGoal" ? "goalType" : "main";
  }

  closeGoalPopup(): void {
    if (this.pendingDueGoal) {
      this.goalService
        .updateGoal(this.pendingDueGoal.id, this.goalBackup)
        .subscribe({
          next: () => {
            alert("You cannot close this modal until a due date is set!");
            this.pendingDueGoal = null;
            this.goalBackup = null;
            this.showGoalPopup = true;
          },
          error: (err) => console.error("Error reverting goal", err),
        });
      return;
    }
    this.showGoalPopup = false;
    this.selectedMonth = null;
    this.selectedMonthGoals = [];
  }

  goBack(): void {
    this.currentView = "goalType";
  }

  deleteGoal(goal: any) {
    if (confirm("Are you sure you want to delete this goal?")) {
      this.goalService.deleteGoal(goal.id).subscribe(
        () => {
          this.archivedGoals = this.archivedGoals.filter(
            (g) => g.id !== goal.id
          );
          this.allGoals = this.allGoals.filter((g) => g.id !== goal.id);
          this.completedGoals = this.completedGoals.filter(
            (g) => g.id !== goal.id
          );
          alert("Goal deleted successfully!");
        },
        (error) => {
          console.error(error);
          alert("Error deleting goal");
        }
      );
    }
  }

  filterGoals(): void {
    const term = this.searchText.trim().toLowerCase();
    if (!term) {
      this.archivedGoals = this.allGoals.filter(
        (g: any) => g.status !== "Completed"
      );
      this.completedGoals = this.allGoals.filter(
        (g: any) => g.status === "Completed"
      );
      return;
    }
    this.archivedGoals = this.allGoals.filter(
      (g: any) =>
        g.status !== "Completed" &&
        ((g.employeeId && g.employeeId.toString().includes(term)) ||
          (g.employeeName && g.employeeName.toLowerCase().includes(term)) ||
          (g.category && g.category.toLowerCase().includes(term)))
    );
    this.completedGoals = this.allGoals.filter(
      (g: any) =>
        g.status === "Completed" &&
        ((g.employeeId && g.employeeId.toString().includes(term)) ||
          (g.employeeName && g.employeeName.toLowerCase().includes(term)) ||
          (g.category && g.category.toLowerCase().includes(term)))
    );
  }

  startGoal(goal: any) {
    if (goal.startDate) return;
    this.goalBackup = { ...goal };
    goal.startDate = new Date().toISOString().split("T")[0];
    goal.isStarted = true;

    if (!goal.dueDate) {
      this.pendingDueGoal = goal;
      alert("You must set a due date for this goal before closing the modal!");
      this.showGoalPopup = true;
    } else {
      this.saveGoalToBackend(goal);
    }
  }

  saveGoalToBackend(goal: any) {
    this.goalService.updateGoal(goal.id, goal).subscribe({
      next: () => {
        this.pendingDueGoal = null;
        this.goalBackup = null;
      },
      error: (err) => {
        console.error("Error saving goal", err);
        Object.assign(goal, this.goalBackup);
        this.pendingDueGoal = null;
        this.goalBackup = null;
      },
    });
  }

  editGoal(goal: any) {
    if (goal.startDate) {
      goal.isEditing = true;
    }
  }

  validateDueDate(goal: any) {
    const today = new Date().toISOString().split("T")[0];
    if (!goal.dueDate) {
      goal.isOverdue = false;
    }
    const due = new Date(goal.dueDate).toISOString().split("T")[0];

    goal.isOverdue = due < today;
  }

  isOverDue(goal: any) {
    return !!goal.isOverdue;
  }

  submitGoal(): void {
    if (this.goalForm.valid) {
      const confirmed = confirm("Are you sure you want to save this new goal?");
      if (!confirmed) return;

      const newGoal = {
        employeeId: this.employeeId,
        employeeName: this.fullName,
        category: this.goalForm.value.category,
        description: this.goalForm.value.description,
        weight: this.goalForm.value.weight,
        startDate: null,
        endDate: null,
        progress: null,
        status: "Pending",
        isStarted: false,
      };

      this.goalService.createGoal(newGoal).subscribe({
        next: (res: any) => {
          this.goalForm.reset();
          this.currentView = "archived";
          this.loadArchivedGoals();
        },
        error: (err) => {
          console.error("Error creating goal:", err);
          alert("Failed to save goal!");
        },
      });
    } else {
      this.goalForm.markAllAsTouched();
    }
  }

  updateGoal(goal: any): void {
    const confirmed = confirm("Do you want to save changes to this goal?");
    if (!confirmed) return;

    this.goalService.updateGoal(goal.id, goal).subscribe({
      error: (err) => console.error("Error updating goal:", err),
    });
  }

  onStatusChange(goal: any) {
    if (goal.status === "Started") {
      goal.isStarted = true;
      goal.startDate = new Date().toISOString().split("T")[0];
    }

    if (goal.status === "Pending") {
      goal.isStarted = false;
      goal.startDate = null;
      goal.endDate = null;
      goal.progress = null;
    }

    if (goal.status === "Completed") {
      goal.endDate = new Date().toISOString().split("T")[0];
      goal.progress = "100%";

      this.archivedGoals = this.archivedGoals.filter((g) => g.id !== goal.id);
      this.completedGoals.push(goal);
    }
    this.updateGoal(goal);
  }

  viewGoals(emp: any): void {
    this.goalService.getGoalByUserid(emp.employeeId).subscribe({
      next: (res: any) => {
        const allGoalsByUser = res.body || [];
        const employeeGoals = allGoalsByUser.filter(
          (g: any) => g.user?.employeeId === emp.employeeId
        );
        const filteredByMonth = this.filterGoalsBySelectedMonth(employeeGoals);

        if (filteredByMonth.length > 0) {
          this.openGoalPopup(filteredByMonth);
        } else {
          this.goalListForPopup = [];
          this.showGoalPopup = true;
        }
      },
      error: (err) => {
        console.error("Error fetching goals:", err);
      },
    });
  }

  openGoalPopup(goals: any[]): void {
    this.goalListForPopup = goals;
    this.showGoalPopup = true;
  }

  getOffset(progress: any): number {
    let value: number;

    if (progress == null) value = 0;
    else if (typeof progress === "string" && progress.includes("%"))
      value = parseFloat(progress.replace("%", ""));
    else value = Number(progress);

    const valid = Math.min(Math.max(value, 0), 100);
    return this.circumference * (1 - valid / 100);
  }

  getProgressValue(progress: any): number {
    if (!progress) return 0;
    const val =
      typeof progress === "string" && progress.includes("%")
        ? parseFloat(progress.replace("%", ""))
        : Number(progress);
    return Math.min(Math.max(val, 0), 100);
  }

  toggleEdit(goal: any) {
    goal.isEditing = !goal.isEditing;
  }

  saveGoal(goal: any) {
    if (!confirm("Are you sure you want to save changes for this goal?")) {
      return;
    }

    if (goal.progress === "100%") {
      goal.status = "Completed";
      goal.endDate = new Date().toISOString().split("T")[0];
      this.archivedGoals = this.archivedGoals.filter((g) => g.id !== goal.id);
      this.completedGoals.push(goal);
      goal.isEditing = false;
    }

    this.goalService.updateGoal(goal.id, goal).subscribe({
      next: () => {
        goal.isEditing = false;

        this.validateDueDate(goal);
      },
      error: (err) => console.error("Error updating goal:", err),
    });
  }

  onDateChange(goal: any) {
    this.updateGoal(goal);
  }

  isPopupView(): boolean {
    return this.currentView === "goalType" || this.currentView === "newGoal";
  }

  loadArchivedGoals() {
    this.goalService.getAllGoals().subscribe({
      next: (res) => {
        this.allGoals = res.body || [];
        this.allGoals.forEach((g: any) => {
          if (g.dueDate) {
            g.isDueDateLocked = true;
            this.validateDueDate(g);
          } else {
            g.isDueDateLocked = false;
          }
        });

        this.archivedGoals = this.allGoals.filter(
          (g: any) => g.status !== "Completed"
        );
        this.completedGoals = this.allGoals.filter(
          (g: any) => g.status === "Completed"
        );
      },
      error: (err) => {
        console.error("Error fetching archived goals", err);
      },
    });
  }

  onDueDateChange(goal: any, event: any) {
    const selected = new Date(event.value);
    selected.setMinutes(selected.getMinutes() - selected.getTimezoneOffset());
    if (!selected) return;
    goal.dueDate = selected.toISOString().split("T")[0];
    if (this.pendingDueGoal && this.pendingDueGoal.id === goal.id) {
      this.pendingDueGoal = null;
      this.previousStartDate = null;
    }
    goal.isDueDateLocked = true;
    this.validateDueDate(goal);
    this.goalService.updateGoal(goal.id, goal).subscribe({
      next: (res) => {
        goal.isDueDateLocked = true;
      },
      error: (err) => {
        console.error("Error saving due date", err);
      },
    });
  }

  storePreviousDueDate(goal: any) {
    this.previousDueDate = goal.dueDate;
  }

  selectMonth(month: string): void {
    this.selectedMonth = month;
    const monthIndex = this.months.indexOf(month);

    this.selectedMonthGoals = this.allGoals.filter((goal) => {
      const startDate = goal.startDate ? new Date(goal.startDate) : null;
      const endDate = goal.endDate ? new Date(goal.endDate) : null;
      const dueDate = goal.dueDate ? new Date(goal.dueDate) : null;

      return (
        (startDate &&
          startDate.getMonth() === monthIndex &&
          startDate.getFullYear() === this.selectedYear) ||
        (endDate &&
          endDate.getMonth() === monthIndex &&
          endDate.getFullYear() === this.selectedYear) ||
        (dueDate &&
          dueDate.getMonth() === monthIndex &&
          dueDate.getFullYear() === this.selectedYear)
      );
    });
  }

  updateDateRangeLabel(): void {
    const month = this.currentDate.toLocaleString("default", { month: "long" });
    const year = this.currentDate.getFullYear();
    this.dateRange = `${month} ${year}`;
  }

  goToPreviousMonth(): void {
    const date = new Date(this.selectedDate);
    date.setMonth(date.getMonth() - 1);
    if (
      this.joiningDate &&
      date <
        new Date(this.joiningDate.getFullYear(), this.joiningDate.getMonth(), 1)
    ) {
      return;
    }

    this.selectedDate = date;
    this.fetchGoals();
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.updateDateRangeLabel();
    this.filterEmployeesByGoalMonth();
  }

  goToNextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.updateDateRangeLabel();
    this.filterEmployeesByGoalMonth();
  }

  filterGoalsBySelectedMonth(goals: any[]): any[] {
    if (!goals || goals.length === 0) return [];

    const selectedMonth = this.currentDate.getMonth();
    const selectedYear = this.currentDate.getFullYear();

    return goals.filter((goal) => {
      const start = goal.startDate ? new Date(goal.startDate) : null;
      const end = goal.endDate ? new Date(goal.endDate) : null;
      const due = goal.dueDate ? new Date(goal.dueDate) : null;

      const isSameMonth =
        (start &&
          start.getMonth() === selectedMonth &&
          start.getFullYear() === selectedYear) ||
        (end &&
          end.getMonth() === selectedMonth &&
          end.getFullYear() === selectedYear) ||
        (due &&
          due.getMonth() === selectedMonth &&
          due.getFullYear() === selectedYear);

      return isSameMonth;
    });
  }

  isGoalInSelectedMonth(goal: any): boolean {
    const selectedMonth = this.currentDate.getMonth();
    const selectedYear = this.currentDate.getFullYear();

    const start = goal.startDate ? new Date(goal.startDate) : null;
    const end = goal.endDate ? new Date(goal.endDate) : null;
    const due = goal.dueDate ? new Date(goal.dueDate) : null;

    const matchStart = !!(
      start &&
      start.getMonth() === selectedMonth &&
      start.getFullYear() === selectedYear
    );

    const matchEnd = !!(
      end &&
      end.getMonth() === selectedMonth &&
      end.getFullYear() === selectedYear
    );

    const matchDue = !!(
      due &&
      due.getMonth() === selectedMonth &&
      due.getFullYear() === selectedYear
    );

    return matchStart || matchEnd || matchDue;
  }

  filterEmployeesByGoalMonth(): void {
    this.filteredEmployees = [];

    this.employees.forEach((emp) => {
      this.goalService.getGoalByUserid(emp.employeeId).subscribe({
        next: (res: any) => {
          const goals = res.body || [];

          const monthGoals = goals.filter((g: any) =>
            this.isGoalInSelectedMonth(g)
          );

          if (monthGoals.length > 0) {
            this.filteredEmployees.push({
              ...emp,
              goalsForMonth: monthGoals,
            });
          }
        },
        error: () => {},
      });
    });
  }
  get paginatedEmployees(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEmployees.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredEmployees.length / this.itemsPerPage)
    );
  }
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
