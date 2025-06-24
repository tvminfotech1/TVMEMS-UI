export interface JobPosting {
  title: string;
  qualifications: string[];
  yearOfPassout: string; // Changed from number to string
  location: string;
  experience: string;     // Changed from number to string
  skills: string[];
  description: string;
  status?: string; // optional field for backend
}
