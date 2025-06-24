export interface Goal {
  category: string;
  description: string;
  metrics: string;
  outcome: string;
  weight: number;
  startDate: string; // ISO string
  endDate: string;
}