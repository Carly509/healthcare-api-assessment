import { Injectable } from '@nestjs/common';
import { HttpService } from '../http/http.service';
import { Patient, PatientsApiResponse } from './dto';

@Injectable()
export class HealthcareApiService {
  constructor(private readonly httpService: HttpService) {}

  async fetchPatientsPage(
    page: number,
    limit: number = 5,
    retries = 3,
    delayMs = 3000,
  ): Promise<PatientsApiResponse> {
    const axiosInstance = this.httpService.getAxiosInstance();

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(
          `📄 Fetching page ${page} with limit ${limit}... (Attempt ${attempt})`,
        );
        console.log(`➡️ GET /patients?page=${page}&limit=${limit}`);

        const response = await axiosInstance.get<PatientsApiResponse>(
          '/patients',
          {
            params: { page, limit },
          },
        );

        if (!response.data || !Array.isArray(response.data.data)) {
          console.warn(`⚠️ Missing or invalid data on page ${page}, skipping.`);
          return {
            data: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrevious: page > 1,
            },
            metadata: {
              timestamp: new Date().toISOString(),
              version: 'unknown',
              requestId: 'none',
            },
          };
        }

        console.log(`✅ 200 GET /patients?page=${page}&limit=${limit}`);
        console.log(
          `✓ Page ${page} fetched: ${response.data.data.length} patients`,
        );
        return response.data;
      } catch (error) {
        if (error.response?.status === 429 && attempt < retries) {
          console.log(
            `⏳ Rate limit hit. Waiting ${delayMs}ms before retry #${attempt}`,
          );
          await new Promise((res) => setTimeout(res, delayMs));
        } else {
          throw error;
        }
      }
    }

    throw new Error(`Failed to fetch page ${page} after ${retries} retries.`);
  }

  async getAllPatients(): Promise<Patient[]> {
    console.log('=== Starting to fetch all patients ===');

    const allPatients: Patient[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      try {
        const response = await this.fetchPatientsPage(currentPage);
        allPatients.push(...response.data);

        console.log(
          `📊 Progress: ${allPatients.length}/${response.pagination.total} patients fetched`,
        );

        hasMorePages = response.pagination.hasNext;

        if (hasMorePages) {
          currentPage++;
          console.log(`⏭️ Moving to page ${currentPage}...`);
        } else {
          console.log('✓ All pages fetched!');
        }
      } catch (error) {
        console.error(`❌ Error fetching page ${currentPage}:`, error.message);
        throw error;
      }
    }

    console.log(`🎉 Total patients fetched: ${allPatients.length}`);
    console.log('=====================================');

    return allPatients;
  }
}
