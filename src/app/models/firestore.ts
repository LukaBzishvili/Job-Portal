export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';

export interface Job {
  id?: string;
  title: string;
  jobType: JobType;
  salary: number | string;
  company: string;
  companyLocation: string;
  applicants: string[];
  link: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Filter {
  id: string;
  open?: boolean;
  [key: string]: any;
}
