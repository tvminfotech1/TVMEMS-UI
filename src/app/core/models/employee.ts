export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
}

export interface Employee {
  
  id: number;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  joiningDate: string; 
  employeeType: string;
  location: string;
  status: string;
  ctc: number;
  basicSalary: number;
  inHandSalary: number;
  aadhaarNumber: string;
  panNumber: string;
  bankDetails: BankDetails; 
}

export interface Payruns {
  employeeId: number;
  employeeName: string;
  profileImageUrl: string;
  accountNumber: string;
  status: string;
}
