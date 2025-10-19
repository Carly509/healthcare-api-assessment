import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { HttpModule } from './http/http.module';
import { HealthcareApiModule } from './healthcare-api/healthcare-api.module';
import { RiskScoringModule } from './risk-scoring/risk-scoring.module';
import { AlertManagementModule } from './alert-management/alert-management.module';
import { SubmissionModule } from './submission/submission.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HttpModule,
    HealthcareApiModule,
    RiskScoringModule,
    AlertManagementModule,
    SubmissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
