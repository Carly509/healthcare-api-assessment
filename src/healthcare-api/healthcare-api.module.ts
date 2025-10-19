import { Module } from '@nestjs/common';
import { HealthcareApiService } from './healthcare-api.service';
import { HttpModule } from '../http/http.module';

@Module({
  imports: [HttpModule],
  providers: [HealthcareApiService],
  exports: [HealthcareApiService],
})
export class HealthcareApiModule {}
