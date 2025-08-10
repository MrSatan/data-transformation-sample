import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ConfigService } from '@nestjs/config';
import { JobOffersService } from '../job-offers/job-offers.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
    private readonly jobOffersService: JobOffersService,
  ) {}

  onModuleInit() {
    let cronTime = this.configService.get<string>('CRON_SCHEDULE');
    if (!cronTime) {
      cronTime = '*/10 * * * * *';
    }

    const job = new CronJob(cronTime, () => this.handleCron());

    this.schedulerRegistry.addCronJob('processJobFeeds', job);
    job.start();
    this.logger.log(
      `Job 'processJobFeeds' scheduled with frequency: ${cronTime}`,
      SchedulerService.name,
    );
  }

  handleCron() {
    this.logger.log(
      'Triggering scheduled job: processJobFeeds',
      SchedulerService.name,
    );
    this.jobOffersService.processJobFeeds();
  }
}
