import { IJobOfferMapper } from '../../src/job-offers/mapper/IJobOfferMapper';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import {
  JobOffersService,
  CreateJobOfferType,
} from '../../src/job-offers/job-offers.service';
import { ProvidersService } from '../../src/providers/providers.service';
import { JOB_OFFER_QUERY_BUILDER } from '../../src/job-offers/query-builder-helper.token';
import { QueryJobOfferDto } from '../../src/job-offers/dto/query-job-offer.dto';
import { JobOffer } from '../../src/entities/job-offer.entity';
import { JOB_OFFER_MAPPERS } from '../../src/job-offers/mapper/mappers.token';

const mockJobOfferRepository = {
  upsert: jest.fn(),
};

const mockQueryBuilder = {
  getManyAndCount: jest.fn(),
};
const mockQueryBuilderHelper = {
  build: jest.fn().mockReturnValue(mockQueryBuilder),
};

const mockProvidersService = {
  fetchJobsFromProvider1: jest.fn(),
  fetchJobsFromProvider2: jest.fn(),
};

// We can create a simple mock for a mapper
const mockMapper: IJobOfferMapper<any> = {
  providerName: 'TestProvider',
  transform: jest.fn((data) => data as CreateJobOfferType),
};

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

describe('JobOffersService', () => {
  let service: JobOffersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobOffersService,
        {
          provide: getRepositoryToken(JobOffer),
          useValue: mockJobOfferRepository,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
        {
          provide: ProvidersService,
          useValue: mockProvidersService,
        },
        {
          provide: JOB_OFFER_MAPPERS,
          useValue: [mockMapper],
        },
        {
          provide: JOB_OFFER_QUERY_BUILDER,
          useValue: mockQueryBuilderHelper,
        },
      ],
    }).compile();

    service = module.get<JobOffersService>(JobOffersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should correctly build a query and return a paginated response', async () => {
      // Arrange
      const queryDto = new QueryJobOfferDto(); // Uses defaults: page 1, limit 10
      const mockJobs: JobOffer[] = [new JobOffer()];
      const totalCount = 1;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        mockJobs,
        totalCount,
      ]);

      const result = await service.findAll(queryDto);

      expect(mockQueryBuilderHelper.build).toHaveBeenCalledWith(queryDto);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalledTimes(1);

      // Check that the response is formatted correctly
      expect(result.items).toEqual(mockJobs);
      expect(result.totalItems).toEqual(totalCount);
      expect(result.currentPage).toEqual(queryDto.page);
      expect(result.totalPages).toEqual(1);
    });
  });

  describe('processJobFeeds', () => {
    it('should fetch, transform, and save job offers', async () => {
      const saveSpy = jest
        .spyOn(service, 'saveTransformedOffers')
        .mockResolvedValue(undefined);

      const mockProvider1Jobs = [{ jobId: 'p1-1' }];
      const mockProvider2Jobs = { 'p2-1': { position: 'dev' } };

      mockProvidersService.fetchJobsFromProvider1.mockResolvedValue(
        mockProvider1Jobs,
      );
      mockProvidersService.fetchJobsFromProvider2.mockResolvedValue(
        mockProvider2Jobs,
      );

      const mockP1Mapper: IJobOfferMapper<any> = {
        providerName: 'Provider1',
        transform: jest
          .fn()
          .mockReturnValue({ externalId: 'p1-1', title: 'Job 1' }),
      };
      const mockP2Mapper: IJobOfferMapper<any> = {
        providerName: 'Provider2',
        transform: jest
          .fn()
          .mockReturnValue({ externalId: 'p2-1', title: 'Job 2' }),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (service as any).mapperMap = new Map([
        [mockP1Mapper.providerName, mockP1Mapper],
        [mockP2Mapper.providerName, mockP2Mapper],
      ]);

      await service.processJobFeeds();

      expect(mockProvidersService.fetchJobsFromProvider1).toHaveBeenCalledTimes(
        1,
      );
      expect(mockProvidersService.fetchJobsFromProvider2).toHaveBeenCalledTimes(
        1,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockP1Mapper.transform).toHaveBeenCalledWith(mockProvider1Jobs[0]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockP2Mapper.transform).toHaveBeenCalledWith(
        mockProvider2Jobs['p2-1'],
        'p2-1',
      );

      expect(saveSpy).toHaveBeenCalledTimes(1);
      // Check that saveTransformedOffers was called with the combined, transformed data
      expect(saveSpy).toHaveBeenCalledWith([
        { externalId: 'p1-1', title: 'Job 1' },
        { externalId: 'p2-1', title: 'Job 2' },
      ]);

      saveSpy.mockRestore();
    });
  });
});
