import { Patient } from './patient.dto';
import { Pagination } from './pagination.dto';

export interface ApiMetadata {
  timestamp: string;
  version: string;
  requestId: string;
}

export interface PatientsApiResponse {
  data: Patient[];
  pagination: Pagination;
  metadata: ApiMetadata;
}
