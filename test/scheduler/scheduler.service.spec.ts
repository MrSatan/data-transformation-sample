import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { JobOffersService } from '../../src/job-offers/job-offers.service';
import { SchedulerService } from '../../src/schedulers/scheduler.service';

const mockJobOffersService = {
  processJobFeeds: jest.fn(),
};

describe('SchedulerService', () => {
  let schedulerService: SchedulerService;
  let jobOffersService: JobOffersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        Logger,
        { provide: JobOffersService, useValue: mockJobOffersService },
        { provide: ConfigService, useValue: { get: jest.fn() } }, // Mock ConfigService
        {
          provide: SchedulerRegistry,
          useValue: { addCronJob: jest.fn(), getCronJob: jest.fn() },
        },
      ],
    }).compile();

    schedulerService = module.get<SchedulerService>(SchedulerService);
    jobOffersService = module.get<JobOffersService>(JobOffersService);
  });

  it('should be defined', () => {
    expect(schedulerService).toBeDefined();
  });

  describe('handleCron', () => {
    it('should call processJobFeeds on the JobOffersService', () => {
      // Arrange: Reset the mock before the test
      mockJobOffersService.processJobFeeds.mockClear();

      // Act: Manually call the method that the cron job would trigger
      schedulerService.handleCron();

      // Assert: Verify that our core business logic was called exactly once
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jobOffersService.processJobFeeds).toHaveBeenCalledTimes(1);
    });
  });
});
