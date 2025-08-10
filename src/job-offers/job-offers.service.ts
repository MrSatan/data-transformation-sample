import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOffer } from '../entities/job-offer.entity';
import { isPostgresError } from '../util/error';
import { Provider2Mapper } from './mapper/Provider2.mapper';
import { Provider1Mapper } from './mapper/Provider1.mapper';
import { ProvidersService } from '../providers/providers.service';

@Injectable()
export class JobOffersService {
  constructor(
    @InjectRepository(JobOffer)
    private readonly jobOfferRepository: Repository<JobOffer>,
    @Inject(Logger) private readonly logger: Logger,
    private readonly providersService: ProvidersService,
    private readonly provider1Mapper: Provider1Mapper,
    private readonly provider2Mapper: Provider2Mapper,
  ) {}

  async findAll(): Promise<JobOffer[]> {
    return this.jobOfferRepository.find();
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

    const transformedFromProvider1 = provider1Jobs.map((job) =>
      this.provider1Mapper.transform(job),
    );
    const transformedFromProvider2 = Object.keys(provider2Jobs).map((key) =>
      this.provider2Mapper.transform(provider2Jobs[key], key),
    );

    const allTransformedOffers = [
      ...transformedFromProvider1,
      ...transformedFromProvider2,
    ];

    if (allTransformedOffers.length > 0) {
      await this.saveTransformedOffers(allTransformedOffers);
    }
    this.logger.log('Job feed processing finished.', JobOffersService.name);
  }
}
