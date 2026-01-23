export type JobFunction = 'marketing' | 'engineering' | 'design' | 'sales' | 'customer-service';

export type ExperienceLevel = 'entry' | 'junior' | 'middle' | 'senior' | 'lead' | 'director';

export type WorkMode = 'remote' | 'on-site' | 'hybrid';

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';

export interface Job {
  id?: string;

  title: string;
  company: string;
  companyLocation: string;
  salary: number | string;
  link: string;
  applicants: string[];

  jobFunction: JobFunction;
  experienceLevel: ExperienceLevel;
  jobType: JobType;
  workMode: WorkMode;

  createdAt?: any;
  updatedAt?: any;
}

export interface Filter {
  id: string;
  open?: boolean;
  [key: string]: any;
}

export interface User {
  id: string;

  // Identity
  fullName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;

  // Platform
  role: 'user' | 'employer' | 'admin';
  isEmailVerified: boolean;
  isProfileComplete: boolean;

  // Career
  jobTitle?: string;
  experienceLevel?: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  yearsOfExperience?: number;
  skills?: string[];

  // Location
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };

  workPreferences?: {
    remote?: boolean;
    hybrid?: boolean;
    onsite?: boolean;
  };

  // Portfolio
  resumeURL?: string;
  portfolioURL?: string;
  linkedinURL?: string;
  githubURL?: string;

  // Activity
  savedJobs?: string[];
  appliedJobs?: string[];

  // Meta
  createdAt?: any;
  updatedAt?: any;
}
