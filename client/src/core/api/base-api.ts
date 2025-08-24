import apiClient from "./api-client";

export class ApiService {
  protected async get<T>(url: string): Promise<T> {
    const response = await apiClient.get<T>(url);
    return response.data;
  }

  protected async post<T>(url: string, data?: any): Promise<T> {
    const response = await apiClient.post<T>(url, data);
    return response.data;
  }

  protected async put<T>(url: string, data?: any): Promise<T> {
    const response = await apiClient.put<T>(url, data);
    return response.data;
  }

  protected async patch<T>(url: string, data?: any): Promise<T> {
    const response = await apiClient.patch<T>(url, data);
    return response.data;
  }

  protected async delete<T>(url: string): Promise<T> {
    const response = await apiClient.delete<T>(url);
    return response.data;
  }
}
