export interface Provider1JobDto {
  jobId: string;
  title: string;
  details: {
    location: string;
    type: string;
    salaryRange: string;
  };
  company: {
    name: string;
    industry: string;
  };
  skills: string[];
  postedDate: string;
}

export interface Provider1ApiResponse {
  metadata: {
    requestId: string;
    timestamp: string;
  };
  jobs: Provider1JobDto[];
}

// --- Types for Provider 2 ---
export interface Provider2JobDto {
  position: string;
  location: {
    city: string;
    state: string;
    remote: boolean;
  };
  compensation: {
    min: number;
    max: number;
    currency: string;
  };
  employer: {
    companyName: string;
    website: string;
  };
  requirements: {
    experience: number;
    technologies: string[];
  };
  datePosted: string;
}

export interface Provider2ApiResponse {
  status: string;
  data: {
    jobsList: Record<string, Provider2JobDto>;
  };
}
