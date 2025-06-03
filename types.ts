
export interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  repoUrl?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: string;
}

export interface UserProfile {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  skills: string[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
}

export interface JobAlert {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  datePosted: string;
}

export interface MockInterviewQuestion {
  id: string;
  type: 'technical' | 'behavioral';
  question: string;
}

export interface InterviewFeedback {
  clarity: number; // Score 1-5
  relevance: number; // Score 1-5
  confidence: number; // Score 1-5
  suggestions: string[];
}

export enum AlertType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}
