import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormProgressService {
  private completedSteps: Set<number> = new Set<number>();

  // Mark a step as complete
  markStepComplete(step: number): void {
    this.completedSteps.add(step);
  }

  // Check if a step can be accessed
  canAccessStep(step: number): boolean {
    if (step === 1) return true;

    // All previous steps must be completed
    for (let i = 1; i < step; i++) {
      if (!this.completedSteps.has(i)) return false;
    }
    return true;
  }

  // Get all completed steps (optional)
  getCompletedSteps(): number[] {
    return Array.from(this.completedSteps);
  }

  // Reset progress (optional)
  resetProgress(): void {
    this.completedSteps.clear();
  }
}
