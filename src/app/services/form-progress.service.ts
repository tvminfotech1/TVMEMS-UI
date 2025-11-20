import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormProgressService {
  private completedSteps: Set<number> = new Set<number>();

  markStepComplete(step: number): void {
    this.completedSteps.add(step);
  }

  canAccessStep(step: number): boolean {
    if (step === 1) return true;

    for (let i = 1; i < step; i++) {
      if (!this.completedSteps.has(i)) return false;
    }
    return true;
  }

  getCompletedSteps(): number[] {
    return Array.from(this.completedSteps);
  }

  resetProgress(): void {
    this.completedSteps.clear();
  }
}
