export interface SalaryHistory {
  salaryId: string;
  id: number;

  month: string;
  year: number;

  basicSalary: number;
  hra: number;
  medicalAllowance: number;
  conveyanceAllowance: number;
  flexiBenefit: number;
  leaveTravel: number;
  specialAllowance: number;

  pf: number;
  esi: number;
  professionalTax: number;
  incomeTax: number;
  leaveDeduction: number;
  otherDeduction: number;

  netPay: number;
  ctc: number;
  remainingCtc: number;

  nwd: number;
  nol: number;
  payRoleEmployee: any;
}
