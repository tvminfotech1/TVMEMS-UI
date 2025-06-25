export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string; // or Date if you're parsing date
  designation: string;
  department: string;
  joiningDate: string; // or Date
  employeeType: string;
  reportingManager: string;
  location: string;
  status: string;
  ctc: number;
  basicSalary: number;
  inHandSalary: number;
  address: string;
  aadhaarNumber: string;
  panNumber: string;
  bloodGroup: string;
  emergencyContact: string;
  profileImageUrl: string;
  bankDetails: BankDetails; 
}
