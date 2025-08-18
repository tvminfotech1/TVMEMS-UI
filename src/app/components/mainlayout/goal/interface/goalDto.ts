export interface Goal {
  status: string;
  category: string;
  description: string;
  metrics: string;
  outcome: string;
  weight: number;
  startDate: string; // ISO string
  endDate: string;
}