import { Module } from '@nestjs/common';
import { AlertManagementService } from './alert-management.service';

@Module({
  providers: [AlertManagementService],
  exports: [AlertManagementService],
})
export class AlertManagementModule {}
