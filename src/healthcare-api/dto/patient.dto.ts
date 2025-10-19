export interface Patient {
  patient_id: string;
  name: string;
  age: number | string | null;
  gender: string;
  blood_pressure: string | null;
  temperature: number | string | null;
  visit_date: string;
  diagnosis: string;
  medications: string;
}
