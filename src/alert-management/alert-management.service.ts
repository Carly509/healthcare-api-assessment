import { Injectable } from '@nestjs/common';
import { Patient } from '../healthcare-api/dto';
import { PatientRiskScore } from '../risk-scoring/risk-scoring.service';

export interface AlertLists {
  high_risk_patients: string[];
  fever_patients: string[];
  data_quality_issues: string[];
}

@Injectable()
export class AlertManagementService {
  generateAlertLists(
    patients: Patient[],
    scoredPatients: PatientRiskScore[],
  ): AlertLists {
    console.log('Generating alert lists');

    const highRiskPatients = this.filterHighRiskPatients(scoredPatients);
    const feverPatients = this.filterFeverPatients(patients);
    const dataQualityIssues = this.filterDataQualityIssues(scoredPatients);

    console.log(`High-Risk Patients: ${highRiskPatients.length}`);
    console.log(`Fever Patients: ${feverPatients.length}`);
    console.log(`Data Quality Issues: ${dataQualityIssues.length}`);

    return {
      high_risk_patients: highRiskPatients,
      fever_patients: feverPatients,
      data_quality_issues: dataQualityIssues,
    };
  }

  private filterHighRiskPatients(scoredPatients: PatientRiskScore[]): string[] {
    console.log('Filtering high-risk patients');

    const highRiskPatients = scoredPatients
      .filter(
        (patient) => patient.totalRisk >= 5 && !patient.hasDataQualityIssue,
      )
      .map((patient) => patient.patient_id);

    console.log(`Found ${highRiskPatients.length} high-risk patients`);
    if (highRiskPatients.length > 0) {
      console.log('Sample IDs:', highRiskPatients.slice(0, 5).join(', '));
    }

    return highRiskPatients;
  }

  private filterFeverPatients(patients: Patient[]): string[] {
    console.log('Filtering fever patients');

    const feverPatients = patients
      .filter((patient) => {
        if (patient.temperature === null || patient.temperature === undefined) {
          return false;
        }

        const temp =
          typeof patient.temperature === 'string'
            ? parseFloat(patient.temperature)
            : patient.temperature;

        if (isNaN(temp)) {
          return false;
        }

        return temp >= 99.6;
      })
      .map((patient) => patient.patient_id);

    console.log(`Found ${feverPatients.length} fever patients`);
    if (feverPatients.length > 0) {
      console.log('Sample IDs:', feverPatients.slice(0, 5).join(', '));
    }

    return feverPatients;
  }

  private filterDataQualityIssues(
    scoredPatients: PatientRiskScore[],
  ): string[] {
    console.log('Filtering data quality issues');

    const dataQualityIssues = scoredPatients
      .filter((patient) => patient.hasDataQualityIssue)
      .map((patient) => patient.patient_id);

    console.log(
      `Found ${dataQualityIssues.length} patients with data quality issues`,
    );
    if (dataQualityIssues.length > 0) {
      console.log('Sample IDs:', dataQualityIssues.slice(0, 5).join(', '));
    }

    return dataQualityIssues;
  }
}
