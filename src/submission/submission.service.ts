import { Injectable } from '@nestjs/common';
import { HttpService } from '../http/http.service';
import { SubmissionDto, SubmissionResponse } from './dto/submission.dto';

@Injectable()
export class SubmissionService {
  constructor(private httpService: HttpService) {}

  async submitAssessment(
    alertLists: SubmissionDto,
  ): Promise<SubmissionResponse> {
    console.log('Submitting:');
    console.log(
      `  High-Risk Patients: ${alertLists.high_risk_patients.length}`,
    );
    console.log(`  Fever Patients: ${alertLists.fever_patients.length}`);
    console.log(
      `  Data Quality Issues: ${alertLists.data_quality_issues.length}`,
    );

    try {
      const axiosInstance = this.httpService.getAxiosInstance();

      const response = await axiosInstance.post<SubmissionResponse>(
        '/submit-assessment',
        alertLists,
      );

      console.log('\n=== Submission Response ===');
      console.log('Status:', response.data.success ? 'SUCCESS' : 'FAILED');
      console.log('Message:', response.data.message);

      if (response.data.results) {
        const results = response.data.results;
        console.log('Results:');
        console.log(
          `  Score: ${results.score}/${results.breakdown.high_risk.max + results.breakdown.fever.max + results.breakdown.data_quality.max}`,
        );
        console.log(`  Percentage: ${results.percentage}%`);
        console.log(`  Status: ${results.status}`);

        console.log('Breakdown:');
        console.log(
          `  High-Risk: ${results.breakdown.high_risk.score}/${results.breakdown.high_risk.max} (${results.breakdown.high_risk.matches}/${results.breakdown.high_risk.correct} correct, ${results.breakdown.high_risk.submitted} submitted)`,
        );
        console.log(
          `  Fever: ${results.breakdown.fever.score}/${results.breakdown.fever.max} (${results.breakdown.fever.matches}/${results.breakdown.fever.correct} correct, ${results.breakdown.fever.submitted} submitted)`,
        );
        console.log(
          `  Data Quality: ${results.breakdown.data_quality.score}/${results.breakdown.data_quality.max} (${results.breakdown.data_quality.matches}/${results.breakdown.data_quality.correct} correct, ${results.breakdown.data_quality.submitted} submitted)`,
        );

        console.log('Feedback:');
        if (results.feedback.strengths.length > 0) {
          console.log('  Strengths:');
          results.feedback.strengths.forEach((strength) =>
            console.log(`    ${strength}`),
          );
        }
        if (results.feedback.issues.length > 0) {
          console.log('  Issues:');
          results.feedback.issues.forEach((issue) =>
            console.log(`    ${issue}`),
          );
        }

        console.log(`Attempt: ${results.attempt_number}/3`);
        console.log(`Remaining attempts: ${results.remaining_attempts}`);
        console.log(
          `Personal best: ${results.is_personal_best ? '🏆 Yes' : 'No'}`,
        );
        console.log(`Can resubmit: ${results.can_resubmit ? '✓ Yes' : '✗ No'}`);
      }

      console.log('===========================\n');

      return response.data;
    } catch (error) {
      console.error('Submission Failed!');
      console.error('Error:', error.message);

      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response:', error.response.data);
      }

      console.log('===========================\n');
      throw error;
    }
  }
}
