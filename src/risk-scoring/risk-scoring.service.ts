import { Injectable } from '@nestjs/common';
import { Patient } from '../healthcare-api/dto';

export interface PatientRiskScore {
  patient_id: string;
  bpRisk: number;
  tempRisk: number;
  ageRisk: number;
  totalRisk: number;
  hasDataQualityIssue: boolean;
}

@Injectable()
export class RiskScoringService {
  calculateBloodPressureRisk(bloodPressure: string | null): number {
    if (!bloodPressure || typeof bloodPressure !== 'string') {
      console.log(`  BP: Invalid/Missing - 0 points`);
      return 0;
    }

    const parts = bloodPressure.split('/');
    if (parts.length !== 2) {
      console.log(`  BP: Invalid format "${bloodPressure}" - 0 points`);
      return 0;
    }

    const systolic = parseInt(parts[0]);
    const diastolic = parseInt(parts[1]);

    if (isNaN(systolic) || isNaN(diastolic)) {
      console.log(`  BP: Non-numeric values "${bloodPressure}" - 0 points`);
      return 0;
    }

    if (systolic >= 140 || diastolic >= 90) {
      console.log(`  BP: ${bloodPressure} - Stage 2 - 4 points`);
      return 4;
    }

    if (
      (systolic >= 130 && systolic <= 139) ||
      (diastolic >= 80 && diastolic <= 89)
    ) {
      console.log(`  BP: ${bloodPressure} - Stage 1 - 3 points`);
      return 3;
    }

    if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
      console.log(`  BP: ${bloodPressure} - Elevated - 2 points`);
      return 2;
    }

    if (systolic < 120 && diastolic < 80) {
      console.log(`  BP: ${bloodPressure} - Normal - 1 point`);
      return 1;
    }

    console.log(`  BP: ${bloodPressure} - Edge case - 0 points`);
    return 0;
  }

  calculateTemperatureRisk(temperature: number | string | null): number {
    if (temperature === null || temperature === undefined) {
      console.log(`  Temp: Invalid/Missing - 0 points`);
      return 0;
    }

    const temp =
      typeof temperature === 'string' ? parseFloat(temperature) : temperature;

    if (isNaN(temp)) {
      console.log(`  Temp: Non-numeric "${temperature}" - 0 points`);
      return 0;
    }

    if (temp >= 101.0) {
      console.log(`  Temp: ${temp}°F - High Fever - 2 points`);
      return 2;
    }

    if (temp >= 99.6 && temp <= 100.9) {
      console.log(`  Temp: ${temp}°F - Low Fever - 1 point`);
      return 1;
    }
    console.log(`  Temp: ${temp}°F - Normal - 0 points`);
    return 0;
  }

  calculateAgeRisk(age: number | string | null): number {
    if (age === null || age === undefined) {
      console.log(`  Age: Invalid/Missing - 0 points`);
      return 0;
    }

    const ageNum = typeof age === 'string' ? parseInt(age) : age;

    if (isNaN(ageNum)) {
      console.log(`  Age: Non-numeric "${age}" - 0 points`);
      return 0;
    }

    if (ageNum > 65) {
      console.log(`  Age: ${ageNum} years - Over 65 - 2 points`);
      return 2;
    }

    if (ageNum >= 40 && ageNum <= 65) {
      console.log(`  Age: ${ageNum} years - 40-65 - 1 point`);
      return 1;
    }

    if (ageNum < 40) {
      console.log(`  Age: ${ageNum} years - Under 40 - 1 point`);
      return 1;
    }
    console.log(`  Age: ${ageNum} - Edge case - 0 points`);
    return 0;
  }

  hasDataQualityIssue(patient: Patient): boolean {
    const bpInvalid =
      !patient.blood_pressure ||
      typeof patient.blood_pressure !== 'string' ||
      patient.blood_pressure.split('/').length !== 2 ||
      isNaN(parseInt(patient.blood_pressure.split('/')[0])) ||
      isNaN(parseInt(patient.blood_pressure.split('/')[1]));

    const tempInvalid =
      patient.temperature === null ||
      patient.temperature === undefined ||
      isNaN(
        typeof patient.temperature === 'string'
          ? parseFloat(patient.temperature)
          : patient.temperature,
      );

    const ageInvalid =
      patient.age === null ||
      patient.age === undefined ||
      isNaN(
        typeof patient.age === 'string' ? parseInt(patient.age) : patient.age,
      );

    return bpInvalid || tempInvalid || ageInvalid;
  }

  scorePatient(patient: Patient): PatientRiskScore {
    console.log(`Scoring Patient: ${patient.patient_id} (${patient.name})`);

    const bpRisk = this.calculateBloodPressureRisk(patient.blood_pressure);
    const tempRisk = this.calculateTemperatureRisk(patient.temperature);
    const ageRisk = this.calculateAgeRisk(patient.age);
    const totalRisk = bpRisk + tempRisk + ageRisk;
    const hasDataQualityIssue = this.hasDataQualityIssue(patient);

    console.log(
      `Total Risk Score: ${totalRisk} (BP:${bpRisk} + Temp:${tempRisk} + Age:${ageRisk})`,
    );
    console.log(`Data Quality Issue: ${hasDataQualityIssue ? 'YES' : '✓ NO'}`);

    return {
      patient_id: patient.patient_id,
      bpRisk,
      tempRisk,
      ageRisk,
      totalRisk,
      hasDataQualityIssue,
    };
  }

  scoreAllPatients(patients: Patient[]): PatientRiskScore[] {
    console.log(`Total patients to score: ${patients.length}\n`);

    const scoredPatients = patients.map((patient) =>
      this.scorePatient(patient),
    );
    console.log(`Total patients scored: ${scoredPatients.length}`);
    return scoredPatients;
  }
}
