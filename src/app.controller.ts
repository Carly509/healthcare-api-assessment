import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * POST /run-assessment
   * Manually trigger the complete workflow
   */
  @Post('run-assessment')
  async runAssessment() {
    return await this.appService.runCompleteWorkflow();
  }
}
