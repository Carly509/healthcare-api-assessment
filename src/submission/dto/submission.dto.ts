export interface SubmissionDto {
  high_risk_patients: string[];
  fever_patients: string[];
  data_quality_issues: string[];
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  results?: {
    score: number;
    percentage: number;
    status: string;
    breakdown: {
      high_risk: {
        score: number;
        max: number;
        correct: number;
        submitted: number;
        matches: number;
      };
      fever: {
        score: number;
        max: number;
        correct: number;
        submitted: number;
        matches: number;
      };
      data_quality: {
        score: number;
        max: number;
        correct: number;
        submitted: number;
        matches: number;
      };
    };
    feedback: {
      strengths: string[];
      issues: string[];
    };
    attempt_number: number;
    remaining_attempts: number;
    is_personal_best: boolean;
    can_resubmit: boolean;
  };
}
