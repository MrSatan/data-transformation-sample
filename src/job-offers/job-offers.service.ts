import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOffer } from '../entities/job-offer.entity';
import { isPostgresError } from '../util/error';
import { ProvidersService } from '../providers/providers.service';
import { QueryJobOfferDto } from './dto/query-job-offer.dto';
import { PaginationResponseDto } from '../shared/dto/pagination-response.dto';
import { QueryBuilderHelper } from '../util/query-builder.helper';
import { JOB_OFFER_QUERY_BUILDER } from './query-builder-helper.token';
import { JOB_OFFER_MAPPERS } from './mapper/mappers.token';
import { IJobOfferMapper } from './mapper/IJobOfferMapper';

export type CreateJobOfferType = Omit<
  JobOffer,
  'id' | 'createdAt' | 'updatedAt'
>;

@Injectable()
export class JobOffersService {
  private readonly mapperMap: Map<string, IJobOfferMapper<any>>;

  constructor(
    @InjectRepository(JobOffer)
    private readonly jobOfferRepository: Repository<JobOffer>,
    @Inject(Logger) private readonly logger: Logger,
    private readonly providersService: ProvidersService,
    @Inject(JOB_OFFER_MAPPERS) private readonly mappers: IJobOfferMapper<any>[],
    @Inject(JOB_OFFER_QUERY_BUILDER)
    private readonly queryBuilderHelper: QueryBuilderHelper<JobOffer>,
  ) {
    this.mapperMap = new Map(
      mappers.map((mapper) => [mapper.providerName, mapper]),
    );
  }

  async findAll(
    queryDto: QueryJobOfferDto,
  ): Promise<PaginationResponseDto<JobOffer>> {
    const { page, limit } = queryDto;

    const queryBuilder = this.queryBuilderHelper.build(queryDto);

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      totalItems,
      currentPage: page,
      totalPages,
    };
  }

  async saveTransformedOffers(
    transformedOffers: Omit<JobOffer, 'id' | 'createdAt' | 'updatedAt'>[],
  ) {
    let newJobs = 0;
    for (const offer of transformedOffers) {
      try {
        await this.jobOfferRepository.save(offer);
        newJobs++;
      } catch (error) {
        // Skip records with same company , tech name and location
        // We can use upsert alternatively to update current records
        if (isPostgresError(error) && error.code === '23505') {
          // Unique violation error code for PostgresSQL
          this.logger.warn(
            `Duplicate job offer skipped: ${offer.title} at ${offer.companyName}`,
            JobOffersService.name,
          );
        } else {
          this.logger.error(
            `Failed to save job offer: ${offer.title}`,
            JobOffersService.name,
          );
        }
      }
    }
    this.logger.log(
      `Successfully saved ${newJobs} job offers.`,
      JobOffersService.name,
    );
  }

  // Process the cron job
  async processJobFeeds() {
    this.logger.log('Starting job feed processing...', JobOffersService.name);

    const [provider1Jobs, provider2Jobs] = await Promise.all([
      this.providersService.fetchJobsFromProvider1(),
      this.providersService.fetchJobsFromProvider2(),
    ]);

    const allTransformedOffers: CreateJobOfferType[] = [];

    const provider1Mapper = this.mapperMap.get('Provider1');
    if (!provider1Mapper) {
      this.logger.error(
        'Provider1Mapper not found. Ensure it is registered correctly in JobOffersModule.',
      );
    } else {
      const transformed = provider1Jobs
        .map((job) => provider1Mapper.transform(job))
        .filter((offer): offer is CreateJobOfferType => offer !== null);
      allTransformedOffers.push(...transformed);
    }

    // --- Process Provider 2 Data ---
    const provider2Mapper = this.mapperMap.get('Provider2');
    if (!provider2Mapper) {
      this.logger.error(
        'Provider2Mapper not found. Ensure it is registered correctly in JobOffersModule.',
      );
    } else {
      const transformed = Object.keys(provider2Jobs)
        .map((key) => provider2Mapper.transform(provider2Jobs[key], key))
        .filter((offer): offer is CreateJobOfferType => offer !== null);
      allTransformedOffers.push(...transformed);
    }

    if (allTransformedOffers.length > 0) {
      await this.saveTransformedOffers(allTransformedOffers);
    }
    this.logger.log('Job feed processing finished.', JobOffersService.name);
  }
}
