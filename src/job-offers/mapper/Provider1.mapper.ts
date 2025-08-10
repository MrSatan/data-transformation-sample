import { Provider1JobDto } from '../../providers/dto/provider.dto';
import { JobOffer } from '../../entities/job-offer.entity';
import { IJobOfferMapper } from './IJobOfferMapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Provider1Mapper implements IJobOfferMapper<Provider1JobDto> {
  // The 'data' parameter is now strongly typed. No more 'any'!
  transform(
    data: Provider1JobDto,
  ): Omit<JobOffer, 'id' | 'createdAt' | 'updatedAt'> {
    const salaryMatch = data.details.salaryRange.match(/(\d+)k/g);
    const salaryMin = salaryMatch ? parseInt(salaryMatch[0]) * 1000 : null;
    const salaryMax =
      salaryMatch && salaryMatch[1]
        ? parseInt(salaryMatch[1]) * 1000
        : salaryMin;

    return {
      externalId: data.jobId,
      title: data.title,
      companyName: data.company.name,
      location: data.details.location,
      description: null,
      salaryMin: salaryMin,
      salaryMax: salaryMax,
      currency: 'USD',
      skills: data.skills,
      postedAt: new Date(data.postedDate),
      sourceApi: 'Provider1',
    };
  }
}
