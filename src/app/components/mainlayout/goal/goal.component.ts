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
  goals:Goal [] = [];

  // ✅ Use the actual API endpoint from your backend (not Swagger UI URL)
  private apiUrl = 'http://localhost:8080/goals';

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
  }

  fetchGoals(): void {
    this.http.get<Goal[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.goals = data;
      },
      error: (err) => {
        console.error('❌ Error fetching goals:', err.message || err);
        alert('⚠️ Failed to load goals from the server. Please try again later.');
      }
    });
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
        console.error('❌ Error submitting goal:', err.message || err);
        alert('❌ Failed to submit goal. Please try again.');
      }
    });
  } else {
    alert('Please fill all required fields correctly.');
    this.goalForm.markAllAsTouched();
  }
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
}
