import { Injectable } from '@nestjs/common';
import { HttpService } from '../http/http.service';
import { Patient, PatientsApiResponse } from './dto';

@Injectable()
export class HealthcareApiService {
  constructor(private httpService: HttpService) {}

  async fetchPatientsPage(
    page: number,
    limit: number = 5,
  ): Promise<PatientsApiResponse> {
    const axiosInstance = this.httpService.getAxiosInstance();
    const response = await axiosInstance.get('/patients', {
      params: { page, limit },
    });
    const rawData = response.data;

    if (rawData.data && Array.isArray(rawData.data)) {
      return rawData as PatientsApiResponse;
    }

    if (rawData.patients && Array.isArray(rawData.patients)) {
      const convertedResponse: PatientsApiResponse = {
        data: rawData.patients,
        pagination: {
          page: rawData.current_page || page,
          limit: rawData.per_page || limit,
          total: rawData.total_records || 0,
          totalPages: Math.ceil(
            (rawData.total_records || 0) / (rawData.per_page || limit),
          ),
          hasNext:
            rawData.current_page <
            Math.ceil(
              (rawData.total_records || 0) / (rawData.per_page || limit),
            ),
          hasPrevious: rawData.current_page > 1,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: 'v1.0',
          requestId: 'converted',
        },
      };
      return convertedResponse;
    }

    throw new Error(`Invalid API response structure for page ${page}`);
  }

  async getAllPatients(): Promise<Patient[]> {
    const allPatients: Patient[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      try {
        const response = await this.fetchPatientsPage(currentPage);

        if (!response.data || !Array.isArray(response.data)) {
          throw new Error(`Invalid data format on page ${currentPage}`);
        }

        allPatients.push(...response.data);

        hasMorePages = response.pagination?.hasNext || false;

        if (hasMorePages) {
          currentPage++;
          await this.delay(500);
        }
      } catch (error) {
        if (error.response?.status === 429) {
          const retryAfter = error.response.data?.retry_after || 5;
          await this.delay(retryAfter * 1000);
          continue;
        }
        throw error;
      }
    }

    return allPatients;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
