import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthcareApiService } from './healthcare-api/healthcare-api.service';
import { Patient } from './healthcare-api/dto';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly healthcareApiService: HealthcareApiService,
  ) {}

  async onModuleInit() {
    // Log environment config
    this.logger.log('=== Environment Configuration ===');
    this.logger.log(
      `API Base URL: ${this.configService.get<string>('API_BASE_URL')}`,
    );
    this.logger.log(
      `API Key: ${this.configService.get<string>('API_KEY') ? '✓ Loaded' : '✗ Missing'}`,
    );
    this.logger.log('===============================');

    // Log HTTP client config status
    this.logger.log('=== HTTP Client Configuration ===');
    this.logger.log(
      `Base URL: ${this.configService.get<string>('API_BASE_URL')}`,
    );
    this.logger.log(
      `API Key configured: ${this.configService.get<string>('API_KEY') ? '✓ Yes' : '✗ No'}`,
    );
    this.logger.log('✓ HTTP Client initialized with retry logic');
    this.logger.log('=================================');

    // Fetch all patients with pagination and logging
    this.logger.log('=== Testing Pagination - Fetching All Patients ===');

    try {
      const allPatients: Patient[] =
        await this.healthcareApiService.getAllPatients();

      this.logger.log(
        `✅ SUCCESS: All patients fetched! Total patients: ${allPatients.length}`,
      );

      this.logger.log('--- Sample Patients (First 3) ---');
      allPatients.slice(0, 3).forEach((patient, i) => {
        this.logger.log(
          `Patient ${i + 1}: ID: ${patient.patient_id} Name: ${patient.name} Age: ${patient.age} BP: ${patient.blood_pressure} Temp: ${patient.temperature}`,
        );
      });
      this.logger.log('----------------------------------');
    } catch (error) {
      this.logger.error('✗ Failed to fetch all patients: ' + error.message);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
