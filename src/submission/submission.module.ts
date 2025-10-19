import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { HttpModule } from '../http/http.module';

@Module({
  imports: [HttpModule],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
