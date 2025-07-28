// API configuration and base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}

export interface CreateInspectionRequest {
  reportNo: string;
  date: string;
  location: string;
  type: string;
  status: string;
  inspectors: string[];
  trees: Array<{ name: string; quantity: number }>;
  notes: string;
  pictures: string[];
  followUp: string;
}

export interface UpdateInspectionRequest {
  reportNo?: string;
  date?: string;
  location?: string;
  type?: string;
  status?: string;
  inspectors?: string[];
  trees?: Array<{ name: string; quantity: number }>;
  notes?: string;
  pictures?: string[];
  followUp?: string;
}

export interface UpdateInspectionRequestBackend {
  reportNo?: string;
  date?: string;
  location?: string;
  type?: string;
  status?: string;
  inspectors?: string; // JSON string
  trees?: string; // JSON string
  notes?: string;
  pictures?: string; // JSON string
  followUp?: string;
}

export interface InspectionResponse {
  id: string;
  report_number: string;
  date: string;
  location: string;
  type: string;
  status: string;
  inspectors: string;
  trees: string;
  notes: string;
  pictures: string;
  created_at: string;
  updated_at: string;
}

export interface InspectionRecordFrontendResponse {
  id?: string;
  reportNo: string;
  inspectors: string[];
  date: string;
  location: string;
  type: string;
  status: string;
  followUp: string;
  trees: Array<{ name: string; quantity: number }>;
  notes: string;
  pictures: string[];
}

class InspectionApiService {
  private baseUrl = `${API_BASE_URL}/inspection`;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getInspectionReports(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<ApiResponse<InspectionRecordFrontendResponse[]>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/frontend?${searchParams.toString()}`;
    return this.request<InspectionRecordFrontendResponse[]>(endpoint);
  }

  async getInspectionReport(
    id: string
  ): Promise<ApiResponse<InspectionResponse>> {
    return this.request<InspectionResponse>(`/${id}`);
  }

  async createInspectionReport(
    data: CreateInspectionRequest
  ): Promise<ApiResponse<InspectionResponse>> {
    return this.request<InspectionResponse>("/frontend", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createInspectionReportFrontend(
    data: any // Frontend record format
  ): Promise<ApiResponse<InspectionResponse>> {
    return this.request<InspectionResponse>("/frontend", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateInspectionReport(
    id: string,
    data: UpdateInspectionRequest | UpdateInspectionRequestBackend
  ): Promise<ApiResponse<InspectionResponse>> {
    return this.request<InspectionResponse>(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteInspectionReport(
    id: string
  ): Promise<ApiResponse<InspectionResponse>> {
    return this.request<InspectionResponse>(`/${id}`, {
      method: "DELETE",
    });
  }

  async generateReportNumber(): Promise<{
    success: boolean;
    message: string;
    report_number: string;
  }> {
    const response = await fetch(`${this.baseUrl}/generate/report-number`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async searchInspectionReports(
    query: string,
    params?: { skip?: number; limit?: number }
  ): Promise<ApiResponse<InspectionResponse[]>> {
    const searchParams = new URLSearchParams({ q: query });

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/search?${searchParams.toString()}`;
    return this.request<InspectionResponse[]>(endpoint);
  }
}

export const inspectionApiService = new InspectionApiService();
