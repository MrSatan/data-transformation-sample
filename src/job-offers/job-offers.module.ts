import { Logger, Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { JobOffersController } from './job-offers.controller';
import { JobOffersService } from './job-offers.service';
import { JobOffer } from '../entities/job-offer.entity';
import { ProvidersModule } from '../providers/Providers.module';
import { Filter, FilterOperator } from '../util/filter';
import { QueryBuilderHelper } from '../util/query-builder.helper';
import { Repository } from 'typeorm';
import { JOB_OFFER_QUERY_BUILDER } from './query-builder-helper.token';
import { Provider1Mapper } from './mapper/Provider1.mapper';
import { Provider2Mapper } from './mapper/Provider2.mapper';
import { JOB_OFFER_MAPPERS } from './mapper/mappers.token';
import { IJobOfferMapper } from './mapper/IJobOfferMapper';

@Module({
  imports: [TypeOrmModule.forFeature([JobOffer]), ProvidersModule],
  controllers: [JobOffersController],
  providers: [
    JobOffersService,
    Logger,
    Provider1Mapper,
    Provider2Mapper,
    {
      provide: JOB_OFFER_MAPPERS,
      useFactory: (...mappers: IJobOfferMapper<any>[]) => mappers,
      inject: [Provider1Mapper, Provider2Mapper],
    },
    {
      provide: JOB_OFFER_QUERY_BUILDER,
      useFactory: (repository: Repository<JobOffer>) => {
        const queryBuilderHelper = new QueryBuilderHelper(
          repository,
          'jobOffer',
        );
        queryBuilderHelper
          .addFilter(
            'title',
            new Filter<JobOffer>('title', FilterOperator.ILIKE),
          )
          .addFilter(
            'location',
            new Filter<JobOffer>('location', FilterOperator.ILIKE),
          )
          .addFilter(
            'minSalary',
            new Filter<JobOffer>('salaryMin', FilterOperator.GTE),
          )
          .addFilter(
            'skills',
            new Filter<JobOffer>('skills', FilterOperator.CONTAINS, (value) =>
              typeof value === 'string' ? value.split(',') : [],
            ),
          );

        return queryBuilderHelper;
      },
      inject: [getRepositoryToken(JobOffer)],
    },
  ],
  exports: [JobOffersService],
})
export class JobOffersModule {}
