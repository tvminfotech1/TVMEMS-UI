// import { HttpClient } from '@angular/common/http';
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// interface Goal {
//   category: string;
//   description: string;
//   metrics: string;
//   outcome: string;
//   weight: number;
//   startDate: string;
//   endDate: string;
// }

// @Component({
//   selector: 'app-goal',
//   templateUrl: './goal.component.html',
//   styleUrls: ['./goal.component.css']
// })
// export class GoalComponent implements OnInit {
//    currentView: 'main' | 'goalType' | 'newGoal' = 'main';
//   goalForm!: FormGroup;
//   goals: Goal[] = [];

//   constructor(private fb: FormBuilder, private http: HttpClient) {}

//   ngOnInit(): void {
//     this.goalForm = this.fb.group({
//       category: ['', Validators.required],
//       description: ['', [Validators.required, Validators.maxLength(35)]],
//       metrics: ['', Validators.required],
//       outcome: ['', Validators.required],
//       weight: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
//       startDate: ['', Validators.required],
//       endDate: ['', Validators.required],
//     });

//     this.loadGoals();
//   }

//   loadGoals(): void {
//     this.http.get<Goal[]>('assets/goals.json').subscribe((data) => {
//       this.goals = data;
//     });
//   }

//   goToGoalType() {
//     this.currentView = 'goalType';
//   }

//   move() {
//     this.currentView = 'newGoal';
//   }

//   goClose() {
//     this.currentView = this.currentView === 'newGoal' ? 'goalType' : 'main';
//   }

//   goBack() {
//     this.currentView = 'goalType';
//   }

//   submitGoal() {
//     if (this.goalForm.valid) {
//       const newGoal = this.goalForm.value;
//       this.goals.push(newGoal);
//       alert('Goal submitted successfully!');
//       this.goalForm.reset();
//       this.currentView = 'main';
//     } else {
//       alert('Please fill all required fields correctly.');
//       this.goalForm.markAllAsTouched();
//     }
//   }
// }
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Goal } from './interface/goalDto';



@Component({
  selector: 'app-goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.css']
})
export class GoalComponent implements OnInit {
  currentView: 'main' | 'goalType' | 'newGoal' = 'main';
  goalForm!: FormGroup;
  goals: Goal[] = [];
  filteredGoals: Goal[] = [];
  selectedMonth: string = '';
  selectedLabel: string = '';
  previousMonthOptions: { value: string, label: string }[] = [];

  private apiUrl = 'http://localhost:8080/goals'; // 🔁 Your backend API

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.goalForm = this.fb.group({
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(35)]],
      metrics: ['', Validators.required],
      outcome: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });

    this.fetchGoals();
    this.generatePreviousMonths();
  }

  // fetchGoals(): void {
  //   this.http.get<Goal[]>(this.apiUrl).subscribe({
  //     next: (data) => {
  //       this.goals = data;
  //       this.filteredGoals = data;
  //     },
  //     error: (err) => {
  //       console.error('Error fetching goals:', err.message || err);
  //       alert('⚠️ Failed to load goals.');
  //     }
  //   });
  // }
  fetchGoals(): void {
  const requestBody = {
    // example payload: you can customize it
    filter: 'all', // or current, last, etc.
    userId: 1       // optional: if needed
  };

  this.http.post<Goal[]>(this.apiUrl, requestBody).subscribe({
    next: (data) => {
      this.goals = data;
      this.filteredGoals = data;
    },
    error: (err) => {
      console.error('Error fetching goals:', err.message || err);
      alert('⚠️ Failed to load goals.');
    }
  });
}


  generatePreviousMonths(): void {
    const today = new Date();
    for (let i = 1; i <= 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${date.getMonth() + 1}-${date.getFullYear()}`;
      const label = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      this.previousMonthOptions.push({ value, label });
    }
  }

  filterGoalsByMonthYear(): void {
    const today = new Date();

    if (this.selectedMonth === 'current') {
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      this.selectedLabel = 'Current Month';
      this.loadFilteredGoals(month, year);
    } else if (this.selectedMonth === 'last') {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const month = lastMonth.getMonth() + 1;
      const year = lastMonth.getFullYear();
      this.selectedLabel = 'Last Month';
      this.loadFilteredGoals(month, year);
    } else {
      const [monthStr, yearStr] = this.selectedMonth.split('-');
      const month = +monthStr;
      const year = +yearStr;
      const label = this.previousMonthOptions.find(o => o.value === this.selectedMonth)?.label || '';
      this.selectedLabel = label;
      this.loadFilteredGoals(month, year);
    }
  }

  loadFilteredGoals(month: number, year: number): void {
    this.http.get<Goal[]>(`${this.apiUrl}?month=${month}&year=${year}`).subscribe({
      next: (data) => {
        this.filteredGoals = data;
      },
      error: (err) => {
        console.error('Error filtering goals:', err.message || err);
        this.filteredGoals = [];
      }
    });
  }

  goToGoalType(): void {
    this.currentView = 'goalType';
  }

  move(): void {
    this.currentView = 'newGoal';
  }

  goClose(): void {
    this.currentView = this.currentView === 'newGoal' ? 'goalType' : 'main';
  }

  goBack(): void {
    this.currentView = 'goalType';
  }

  submitGoal(): void {
    if (this.goalForm.valid) {
      const newGoal: Goal = this.goalForm.value;
      this.http.post<Goal>(this.apiUrl, newGoal).subscribe({
        next: (savedGoal) => {
          this.goals.push(savedGoal);
          alert('✅ Goal submitted successfully!');
          this.goalForm.reset();
          this.currentView = 'main';
        },   
        error: (err) => {
          console.error('Error submitting goal:', err.message || err);
          alert('❌ Failed to submit goal.');
        }
      });
    } else {
      alert('Please fill all required fields correctly.');
      this.goalForm.markAllAsTouched();
    }
  }



} 
