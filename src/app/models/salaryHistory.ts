export interface SalaryHistory {
  salaryId: string;            // Unique ID like "TVM001-202506"
  id: string;                  // Employee ID

  month: string;               // Format: "YYYY-MM"
  year: number;                // Example: 2025

  // Earnings
  basicSalary: number;
  hra: number;
  medicalAllowance: number;
  conveyanceAllowance: number;
  flexiBenefit: number;
  leaveTravel: number;
  specialAllowance: number;

  // Deductions
  pf: number;
  esi: number;
  professionalTax: number;
  incomeTax: number;
  leaveDeduction: number;
  otherDeduction: number;

  // Final amounts
  netPay: number;
  ctc: number;
  remainingCtc: number;

  nwd: number;
  nol: number;
}
