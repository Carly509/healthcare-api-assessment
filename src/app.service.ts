import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthcareApiService } from './healthcare-api/healthcare-api.service';
import { RiskScoringService } from './risk-scoring/risk-scoring.service';
import { AlertManagementService } from './alert-management/alert-management.service';
import { SubmissionService } from './submission/submission.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    private healthcareApiService: HealthcareApiService,
    private riskScoringService: RiskScoringService,
    private alertManagementService: AlertManagementService,
    private submissionService: SubmissionService,
  ) {
    console.log('Configuration Loaded');
  }

  async onModuleInit() {
    await this.runCompleteWorkflow();
  }

  async runCompleteWorkflow() {
    console.log('Healthcare Assessment Workflow Started');

    try {
      console.log('[1/4] Fetching patients...');
      const patients = await this.healthcareApiService.getAllPatients();
      console.log(`✓ Fetched ${patients.length} patients\n`);

      console.log('[2/4] Calculating risk scores...');
      const scoredPatients = this.riskScoringService.scoreAllPatients(patients);
      console.log(`✓ Scored ${scoredPatients.length} patients\n`);

      console.log('[3/4] Generating alert lists...');
      const alertLists = this.alertManagementService.generateAlertLists(
        patients,
        scoredPatients,
      );
      console.log(`✓ Generated alert lists`);
      console.log(
        `   - High-risk: ${alertLists.high_risk_patients.length} patients`,
      );
      console.log(`   - Fever: ${alertLists.fever_patients.length} patients`);
      console.log(
        `   - Data quality issues: ${alertLists.data_quality_issues.length} patients\n`,
      );

      console.log('[4/4] Submitting assessment...');
      const result = await this.submissionService.submitAssessment(alertLists);

      console.log('Assessment Complete!');

      if (result.results) {
        console.log(
          `Score: ${result.results.score} (${result.results.percentage}%)`,
        );
        console.log(`Status: ${result.results.status}`);
        console.log(`Attempt: ${result.results.attempt_number}/3`);

        if (result.results.feedback.strengths.length > 0) {
          console.log('\nStrengths:');
          result.results.feedback.strengths.forEach((s) =>
            console.log(`  ${s}`),
          );
        }

        if (result.results.feedback.issues.length > 0) {
          console.log('\nIssues:');
          result.results.feedback.issues.forEach((i) => console.log(`  ${i}`));
        }
      }

      return result;
    } catch (error) {
      console.error('Assessment Failed!');
      console.error('Error:', error.message);
      throw error;
    }
  }

  getHello(): string {
    return 'Healthcare Assessment API';
  }
}
