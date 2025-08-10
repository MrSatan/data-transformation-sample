import { Provider2JobDto } from '../../providers/dto/provider.dto';
import { IJobOfferMapper } from './IJobOfferMapper';
import { JobOffer } from '../../entities/job-offer.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Provider2Mapper implements IJobOfferMapper<Provider2JobDto> {
  transform(
    data: Provider2JobDto,
    jobId: string,
  ): Omit<JobOffer, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      externalId: jobId,
      title: data.position,
      companyName: data.employer.companyName,
      location: `${data.location.city}, ${data.location.state}`,
      description: null,
      salaryMin: data.compensation.min,
      salaryMax: data.compensation.max,
      currency: data.compensation.currency,
      skills: data.requirements.technologies,
      postedAt: new Date(data.datePosted),
      sourceApi: 'Provider2',
    };
  }
}
