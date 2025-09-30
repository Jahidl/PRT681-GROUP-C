const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface JobStatus {
  id: string;
  fileName: string;
  status: "Queued" | "Processing" | "Completed" | "Failed" | "Cancelled";
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  errors: string[];
  createdProducts: unknown[];
  createdCategories: string[];
  createdSubcategories: string[];
  createdAtUtc: string;
  startedAtUtc?: string;
  completedAtUtc?: string;
  errorMessage?: string;
  progressPercentage: number;
  fileSizeBytes: number;
  uploadedBy?: string;
  duration?: string;
  isCompleted: boolean;
  statusText: string;
}

export interface JobListResponse {
  jobs: JobStatus[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateJobResponse {
  jobId: string;
  message: string;
  status: string;
  createdAtUtc: string;
}

export interface JobStats {
  totalJobs: number;
  totalProductsCreated: number;
  statusBreakdown: Record<string, number>;
  queuedJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
}

export class JobService {
  static async getJobs(
    page = 1,
    pageSize = 10,
    status?: string
  ): Promise<JobListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (status) {
      params.append("status", status);
    }

    const response = await fetch(`${API_BASE_URL}/api/jobs?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  static async getJobById(jobId: string): Promise<JobStatus> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  static async createJob(
    fileName: string,
    csvContent: string,
    fileSizeBytes: number
  ): Promise<CreateJobResponse> {
    const response = await fetch(`${API_BASE_URL}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        csvContent,
        fileSizeBytes,
        uploadedBy: "admin", // TODO: Get from auth context
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    return response.json();
  }

  static async deleteJob(jobId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
  }

  static async getJobStats(): Promise<JobStats> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/stats`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Utility method for polling job status
  static async pollJobStatus(
    jobId: string,
    onUpdate: (job: JobStatus) => void,
    onComplete: (job: JobStatus) => void,
    onError: (error: Error) => void,
    intervalMs = 2000
  ): Promise<() => void> {
    let isPolling = true;

    const poll = async () => {
      try {
        const job = await this.getJobById(jobId);
        onUpdate(job);

        if (job.isCompleted) {
          isPolling = false;
          onComplete(job);
        } else if (isPolling) {
          setTimeout(poll, intervalMs);
        }
      } catch (error) {
        isPolling = false;
        onError(error as Error);
      }
    };

    // Start polling
    poll();

    // Return stop function
    return () => {
      isPolling = false;
    };
  }
}
