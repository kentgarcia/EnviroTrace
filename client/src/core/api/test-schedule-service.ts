import apiClient from "./api-client";

export interface TestSchedule {
  id: string;
  year: number;
  quarter: number;
  assigned_personnel: string;
  conducted_on: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface TestScheduleCreate {
  year: number;
  quarter: number;
  assigned_personnel: string;
  conducted_on: string;
  location: string;
}

export interface TestScheduleUpdate {
  assigned_personnel?: string;
  conducted_on?: string;
  location?: string;
}

class TestScheduleService {
  async getSchedulesByYear(year: number): Promise<TestSchedule[]> {
    const response = await apiClient.get(`/test-schedules/schedules/${year}`);
    return response.data;
  }

  async getScheduleByYearQuarter(
    year: number,
    quarter: number
  ): Promise<TestSchedule> {
    const response = await apiClient.get(
      `/test-schedules/schedules/${year}/${quarter}`
    );
    return response.data;
  }

  async createOrUpdateSchedule(
    schedule: TestScheduleCreate
  ): Promise<TestSchedule> {
    const response = await apiClient.post(
      `/test-schedules/schedules`,
      schedule
    );
    return response.data;
  }

  async updateSchedule(
    year: number,
    quarter: number,
    schedule: TestScheduleUpdate
  ): Promise<TestSchedule> {
    const response = await apiClient.put(
      `/test-schedules/schedules/${year}/${quarter}`,
      schedule
    );
    return response.data;
  }

  async deleteSchedule(year: number, quarter: number): Promise<void> {
    await apiClient.delete(`/test-schedules/schedules/${year}/${quarter}`);
  }
}

export const testScheduleService = new TestScheduleService();
