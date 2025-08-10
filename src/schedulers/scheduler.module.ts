import { Logger, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobOffersModule } from '../job-offers/job-offers.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot(), JobOffersModule],
  providers: [SchedulerService, Logger],
})
export class SchedulerModule {}
